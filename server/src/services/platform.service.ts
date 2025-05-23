import { platforms, PlatformCode } from '../config/platforms';
import { PlatformHandlerFactory } from './platforms/PlatformHandlerFactory';
import { dbClient } from '../lib/db';
import { eq, and } from 'drizzle-orm';
import { platforms as platformsTable, platformConnections } from '../db/schema';

interface Channel {
  id: string;
  platformId: string;
  platform: {
    code: string;
    name: string;
    icon: string;
    color: string;
  };
  accountName: string | null;
  accountId: string;
  lastSync: Date | null;
  isValid: boolean;
  parentConnectionId?: string;
  avatarUrl?: string | null;
}

interface PlatformConnection {
  id: string;
  userId: string;
  platformId: string;
  accessToken: string;
  refreshToken: string | null;
  accountId: string;
  accountName: string | null;
  profileImage: string | null;
  lastSync: Date | null;
  isValid: boolean;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
  parentConnectionId?: string;
  platform: {
    id: string;
    code: string;
    name: string;
    icon: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class PlatformService {
  // Get list of available platform types and user's connected channels
  static async getAvailableChannels(userId: string) {
    const connectedChannels = await dbClient.query.platformConnections.findMany({
      where: eq(platformConnections.userId, userId),
      with: {
        platform: true
      }
    });

    // Get all platform types
    const platformTypes = Object.entries(platforms).map(([code, platform]) => ({
      code,
      name: platform.name,
      icon: platform.icon,
      color: platform.color,
      scopes: platform.scopes,
      authUrl: platform.authUrl,
      tokenUrl: platform.tokenUrl,
      userInfoUrl: platform.userInfoUrl,
      supportsMultipleChannels: code === 'facebook'
    }));

    // Get user's connected channels for each platform type
    const channelsByPlatform = connectedChannels.reduce((acc: Record<string, Channel[]>, channel) => {
      const platformCode = channel.platform.code;
      if (!acc[platformCode]) {
        acc[platformCode] = [];
      }
      acc[platformCode].push({
        id: channel.id,
        platformId: channel.platformId,
        platform: {
          code: channel.platform.code,
          name: channel.platform.name,
          icon: channel.platform.icon,
          color: channel.platform.color
        },
        accountName: channel.accountName,
        accountId: channel.accountId,
        lastSync: channel.lastSync,
        isValid: channel.isValid,
        parentConnectionId: channel.parentConnectionId,
        avatarUrl: channel.profileImage || null
      });
      return acc;
    }, {});

    return {
      platformTypes,
      channels: channelsByPlatform
    };
  }

  // Get OAuth URL for channel connection
  static getAuthUrl(platform: PlatformCode, redirectUri: string, userId: string): string {
    const handler = PlatformHandlerFactory.getHandler(platform);
    return handler.getAuthUrl(redirectUri, userId);
  }

  // Handle OAuth callback and token exchange
  static async handleCallback(
    platform: PlatformCode,
    code: string,
    redirectUri: string,
    state?: string,
    userId?: string,
    clientUrl?: string
  ) {
    const handler = PlatformHandlerFactory.getHandler(platform);
    const tokens = await handler.handleCallback(code, redirectUri, state);
    
    if (userId && clientUrl) {
      const userInfo = await handler.getUserInfo(tokens.accessToken);
      return handler.handleConnection(userId, tokens, userInfo, clientUrl);
    }
    
    return tokens;
  }

  // Get user info from platform
  static async getPlatformUserInfo(platform: PlatformCode, accessToken: string) {
    const handler = PlatformHandlerFactory.getHandler(platform);
    return handler.getUserInfo(accessToken);
  }

  // Save connected channel
  static async saveConnectedChannel(
    userId: string,
    platform: PlatformCode,
    tokens: { accessToken: string; refreshToken: string | null; expiresIn: number; accountId: string },
    platformUserId: string,
    platformUsername: string,
    parentConnectionId?: string
  ) {
    // First, ensure the platform exists
    const [platformRecord] = await dbClient.insert(platformsTable)
      .values({
        code: platform,
        name: platforms[platform].name,
        icon: platforms[platform].icon,
        color: platforms[platform].color
      })
      .onConflictDoUpdate({
        target: platformsTable.code,
        set: {}
      })
      .returning();

    const data = {
      userId,
      platformId: platformRecord.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accountId: platformUserId,
      accountName: platformUsername,
      scopes: platforms[platform].scopes,
      isValid: true
    };

    if (parentConnectionId) {
      (data as any).parentConnectionId = parentConnectionId;
    }

    return dbClient.insert(platformConnections)
      .values(data)
      .returning();
  }

  // Get user's connected channels
  static async getConnectedChannels(userId: string) {
    return dbClient.query.platformConnections.findMany({
      where: eq(platformConnections.userId, userId),
      with: {
        platform: true
      }
    });
  }

  // Disconnect channel
  static async disconnectChannel(channelId: string, userId: string) {
    const channel = await dbClient.query.platformConnections.findFirst({
      where: and(
        eq(platformConnections.id, channelId),
        eq(platformConnections.userId, userId)
      ),
      with: {
        platform: true
      }
    });

    if (!channel) {
      throw new Error('Channel not found');
    }

    // If this is a parent connection (e.g., Facebook user account),
    // also disconnect all child channels (e.g., Facebook pages)
    if (!channel.parentConnectionId) {
      await dbClient.delete(platformConnections)
        .where(eq(platformConnections.parentConnectionId, channelId));
    }

    // Revoke the token if possible
    try {
      const handler = PlatformHandlerFactory.getHandler(channel.platform.code as PlatformCode);
      await handler.revokeToken(channel.accessToken);
    } catch (error) {
      console.error('Failed to revoke token:', error);
    }

    return dbClient.delete(platformConnections)
      .where(and(
        eq(platformConnections.id, channelId),
        eq(platformConnections.userId, userId)
      ))
      .returning();
  }

  // Get channel status
  static async getChannelStatus(userId: string, channelId: string) {
    const channel = await dbClient.query.platformConnections.findFirst({
      where: and(
        eq(platformConnections.id, channelId),
        eq(platformConnections.userId, userId),
        eq(platformConnections.isValid, true)
      ),
      with: {
        platform: true
      }
    });

    if (!channel) {
      return { connected: false };
    }

    return {
      connected: true,
      accountName: channel.accountName,
      accountId: channel.accountId,
      lastSync: channel.lastSync,
      platform: {
        code: channel.platform.code,
        name: channel.platform.name,
        icon: channel.platform.icon
      },
      isParentConnection: !channel.parentConnectionId
    };
  }

  // Sync channel data
  static async syncChannelData(userId: string, channelId: string) {
    const channel = await dbClient.query.platformConnections.findFirst({
      where: {
        id: channelId,
        userId,
        isValid: true
      }
    });

    if (!channel) {
      throw new Error('No valid channel found');
    }

    // TODO: Implement platform-specific data sync
    // This will be implemented for each platform separately

    // Update last sync time
    await dbClient.update(platformConnections)
      .set({ lastSync: new Date() })
      .where(eq(platformConnections.id, channel.id));
  }
} 