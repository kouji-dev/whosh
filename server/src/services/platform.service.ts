import { PrismaClient } from '@prisma/client';
import { platforms, PlatformCode } from '../config/platforms';
import { OAuthTokens } from '../types/platform';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface UserInfoResponse {
  id: string;
  username?: string;
  name?: string;
  email?: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

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
  parentConnectionId?: string; // For channels that belong to a parent connection (e.g., Facebook pages)
}

const prisma = new PrismaClient();

export class PlatformService {
  // Get list of available platform types and user's connected channels
  static async getAvailableChannels(userId: string) {
    const connectedChannels = await prisma.platformConnection.findMany({
      where: { userId },
      include: {
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
      supportsMultipleChannels: code === 'facebook' // Add this flag for platforms that support multiple channels
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
        parentConnectionId: channel.parentConnectionId
      });
      return acc;
    }, {});

    return {
      platformTypes,
      channels: channelsByPlatform
    };
  }

  // Get OAuth URL for channel connection
  static getAuthUrl(platform: PlatformCode, redirectUri: string): string {
    const platformConfig = platforms[platform];
    const scopes = platformConfig.scopes.join(' ');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: platformConfig.clientId,
      redirect_uri: redirectUri,
      scope: scopes
    });

    return `${platformConfig.authUrl}?${params.toString()}`;
  }

  // Handle OAuth callback and token exchange
  static async handleCallback(platform: PlatformCode, code: string, redirectUri: string) {
    const platformConfig = platforms[platform];
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: platformConfig.clientId,
      client_secret: platformConfig.clientSecret
    });

    const response = await fetch(platformConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json() as TokenResponse;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }

  // Get user info from platform
  static async getPlatformUserInfo(platform: PlatformCode, accessToken: string) {
    const platformConfig = platforms[platform];
    const response = await fetch(platformConfig.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const data = await response.json() as UserInfoResponse;
    return {
      id: data.id,
      username: data.username || data.name || data.email
    };
  }

  // Get Facebook pages for a user
  static async getFacebookPages(accessToken: string): Promise<FacebookPage[]> {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook pages');
    }

    const data = await response.json();
    return data.data as FacebookPage[];
  }

  // Save connected channel
  static async saveConnectedChannel(
    userId: string,
    platform: PlatformCode,
    tokens: { accessToken: string; refreshToken: string; expiresIn: number },
    platformUserId: string,
    platformUsername: string,
    parentConnectionId?: string
  ) {
    // First, ensure the platform exists
    const platformRecord = await prisma.platform.upsert({
      where: { code: platform },
      update: {},
      create: {
        code: platform,
        name: platforms[platform].name,
        icon: platforms[platform].icon,
        color: platforms[platform].color
      }
    });

    return prisma.platformConnection.create({
      data: {
        userId,
        platformId: platformRecord.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accountId: platformUserId,
        accountName: platformUsername,
        scopes: platforms[platform].scopes,
        isValid: true,
        parentConnectionId
      }
    });
  }

  // Save Facebook pages as channels
  static async saveFacebookPages(
    userId: string,
    parentConnectionId: string,
    pages: FacebookPage[]
  ) {
    const platformRecord = await prisma.platform.findUnique({
      where: { code: 'facebook' }
    });

    if (!platformRecord) {
      throw new Error('Facebook platform not found');
    }

    const channels = await Promise.all(
      pages.map(page =>
        prisma.platformConnection.create({
          data: {
            userId,
            platformId: platformRecord.id,
            accessToken: page.access_token,
            accountId: page.id,
            accountName: page.name,
            scopes: platforms.facebook.scopes,
            isValid: true,
            parentConnectionId
          }
        })
      )
    );

    return channels;
  }

  // Get user's connected channels
  static async getConnectedChannels(userId: string) {
    return prisma.platformConnection.findMany({
      where: { userId },
      include: {
        platform: true
      }
    });
  }

  // Disconnect channel
  static async disconnectChannel(channelId: string, userId: string) {
    const channel = await prisma.platformConnection.findFirst({
      where: { id: channelId, userId }
    });

    if (!channel) {
      throw new Error('Channel not found');
    }

    // If this is a parent connection (e.g., Facebook user account),
    // also disconnect all child channels (e.g., Facebook pages)
    if (!channel.parentConnectionId) {
      await prisma.platformConnection.deleteMany({
        where: { parentConnectionId: channelId }
      });
    }

    return prisma.platformConnection.delete({
      where: {
        id: channelId,
        userId
      }
    });
  }

  // Get channel status
  static async getChannelStatus(userId: string, channelId: string) {
    const channel = await prisma.platformConnection.findFirst({
      where: {
        id: channelId,
        userId,
        isValid: true
      },
      include: {
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
    const channel = await prisma.platformConnection.findFirst({
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
    await prisma.platformConnection.update({
      where: { id: channel.id },
      data: { lastSync: new Date() }
    });
  }
} 