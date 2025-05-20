import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { platforms, PlatformCode } from '../config/platforms';

const prisma = new PrismaClient();

export class PlatformService {
  // Get list of available platforms
  static async getAvailablePlatforms() {
    return Object.values(platforms).map(platform => ({
      ...platform,
      isConnected: false, // This will be updated based on user's connections
    }));
  }

  // Get OAuth URL for platform connection
  static getAuthUrl(platform: PlatformCode, redirectUri: string): string {
    const platformConfig = platforms[platform];
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    
    switch (platform) {
      case 'instagram':
      case 'facebook':
        return `https://www.facebook.com/${platformConfig.apiVersion}/dialog/oauth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${platformConfig.scopes.join(',')}&` +
          `response_type=code&` +
          `state=${platform}`;
      
      case 'tiktok':
        return 'https://www.tiktok.com/auth/authorize/?' +
          `client_key=${clientId}&` +
          `scope=${platformConfig.scopes.join(',')}&` +
          `response_type=code&` +
          `redirect_uri=${redirectUri}&` +
          `state=${platform}`;
      
      case 'youtube':
        return 'https://accounts.google.com/o/oauth2/v2/auth?' +
          `client_id=${clientId}&` +
          `redirect_uri=${redirectUri}&` +
          `response_type=code&` +
          `scope=${platformConfig.scopes.join(' ')}&` +
          `access_type=offline&` +
          `state=${platform}`;
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Handle OAuth callback and token exchange
  static async handleCallback(platform: PlatformCode, code: string, redirectUri: string) {
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];
    
    let tokens;
    switch (platform) {
      case 'instagram':
      case 'facebook':
        tokens = await this.exchangeFacebookToken(code, clientId!, clientSecret!, redirectUri);
        break;
      
      case 'tiktok':
        tokens = await this.exchangeTikTokToken(code, clientId!, clientSecret!, redirectUri);
        break;
      
      case 'youtube':
        tokens = await this.exchangeYouTubeToken(code, clientId!, clientSecret!, redirectUri);
        break;
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return tokens;
  }

  // Get user info from platform
  static async getPlatformUserInfo(platform: PlatformCode, accessToken: string) {
    switch (platform) {
      case 'instagram':
      case 'facebook':
        return this.getFacebookUserInfo(accessToken);
      
      case 'tiktok':
        return this.getTikTokUserInfo(accessToken);
      
      case 'youtube':
        return this.getYouTubeUserInfo(accessToken);
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Get Facebook/Instagram user info
  private static async getFacebookUserInfo(accessToken: string) {
    const response = await axios.get('https://graph.facebook.com/me', {
      params: {
        access_token: accessToken,
        fields: 'id,name,username',
      },
    });

    return {
      id: response.data.id,
      username: response.data.username || response.data.name,
    };
  }

  // Get TikTok user info
  private static async getTikTokUserInfo(accessToken: string) {
    const response = await axios.get('https://open-api.tiktok.com/user/info/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return {
      id: response.data.data.user.open_id,
      username: response.data.data.user.unique_id,
    };
  }

  // Get YouTube user info
  private static async getYouTubeUserInfo(accessToken: string) {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet',
        mine: true,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return {
      id: response.data.items[0].id,
      username: response.data.items[0].snippet.title,
    };
  }

  // Exchange authorization code for access token (Facebook/Instagram)
  private static async exchangeFacebookToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      },
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  }

  // Exchange authorization code for access token (TikTok)
  private static async exchangeTikTokToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    const response = await axios.post('https://open-api.tiktok.com/oauth/access_token/', {
      client_key: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }

  // Exchange authorization code for access token (YouTube)
  private static async exchangeYouTubeToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }

  // Save connected platform account
  static async saveConnectedAccount(userId: string, platform: PlatformCode, tokens: any, platformUserId: string, username: string) {
    return prisma.channel.create({
      data: {
        platformId: platform,
        userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpires: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null,
        platformUserId,
        platformUsername: username,
      },
    });
  }

  // Get user's connected accounts
  static async getConnectedAccounts(userId: string) {
    return prisma.channel.findMany({
      where: { userId },
      include: { platform: true },
    });
  }

  // Disconnect platform account
  static async disconnectAccount(channelId: string, userId: string) {
    return prisma.channel.delete({
      where: {
        id: channelId,
        userId, // Ensure user owns the channel
      },
    });
  }
} 