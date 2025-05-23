import { BasePlatformHandler } from './platform-handler.base';
import { OAuthTokens, UserInfo, ConnectionResult, PublishPostData, CreateChannelDto } from '../channel.types';
import { PlatformCode, platforms } from '../../../config/platforms';
import { ChannelRepository } from '../channel.repository';

interface TikTokAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
}

interface TikTokUserResponse {
  data: {
    user: {
      open_id: string;
      unique_id: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

interface TikTokUploadResponse {
  data: {
    video_id: string;
    upload_url: string;
  };
}

export class TikTokHandler extends BasePlatformHandler {
  private static instance: TikTokHandler;
  private readonly config = platforms.tiktok;
  private readonly channelRepository: ChannelRepository;

  constructor() {
    super('tiktok');
    this.channelRepository = ChannelRepository.getInstance();
  }

  static getInstance(): TikTokHandler {
    if (!TikTokHandler.instance) {
      TikTokHandler.instance = new TikTokHandler();
    }
    return TikTokHandler.instance;
  }

  getAuthUrl(redirectUri: string, userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, redirectUri })).toString('base64');
    const scope = this.config.scopes.join(',');
    const clientId = this.config.clientId;

    return `${this.config.authUrl}?client_key=${clientId}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  }

  async handleCallback(code: string, redirectUri: string, state?: string): Promise<OAuthTokens> {
    if (!state) {
      throw new Error('State is required');
    }

    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());
    const clientId = this.config.clientId;
    const clientSecret = this.config.clientSecret;

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json() as TikTokAuthResponse;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      accountId: data.open_id,
    };
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json() as TikTokUserResponse;
    return {
      id: data.data.user.open_id,
      username: data.data.user.unique_id,
      displayName: data.data.user.display_name,
      avatarUrl: data.data.user.avatar_url,
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    const clientId = this.config.clientId;
    const clientSecret = this.config.clientSecret;

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json() as TikTokAuthResponse;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      accountId: data.open_id,
    };
  }

  async revokeToken(accessToken: string): Promise<void> {
    const clientId = this.config.clientId;
    const clientSecret = this.config.clientSecret;

    const response = await fetch(`${this.config.tokenUrl}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        token: accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke token');
    }
  }

  async handleConnection(userId: string, tokens: OAuthTokens, userInfo: UserInfo, clientUrl: string): Promise<ConnectionResult> {
    try {
      // Check if account already exists
      const existingChannel = await this.channelRepository.findByPlatformAndUserId(this.platformCode, userInfo.id);

      if (existingChannel) {
        // Update existing channel
        await this.channelRepository.update(existingChannel.id, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpires: new Date(Date.now() + tokens.expiresIn * 1000),
          username: userInfo.username,
        });
      } else {
        // Create new channel
        const channelData: CreateChannelDto = {
          userId,
          platformId: this.platformCode,
          platformUserId: userInfo.id,
          username: userInfo.username,
          displayName: userInfo.displayName,
          profileImage: userInfo.avatarUrl,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpires: new Date(Date.now() + tokens.expiresIn * 1000),
          scopes: this.config.scopes,
          isActive: true,
          metadata: {},
        };
        await this.channelRepository.create(channelData);
      }

      return {
        success: true,
        redirectUrl: `${clientUrl}/settings/channels?success=true`,
      };
    } catch (error) {
      return {
        success: false,
        redirectUrl: `${clientUrl}/settings/channels?error=connection_failed`,
        error: error.message,
      };
    }
  }

  async publishPost(data: PublishPostData): Promise<void> {
    const response = await fetch(this.config.uploadUrl!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: data.content,
          privacy_level: 'PUBLIC',
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: 0, // TODO: Get actual video size
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    const uploadData = await response.json() as TikTokUploadResponse;
    const videoId = uploadData.data.video_id;

    // Upload video file
    const videoResponse = await fetch(uploadData.data.upload_url, {
      method: 'PUT',
      body: await fetch(data.mediaUrls[0]).then(r => r.blob()),
    });

    if (!videoResponse.ok) {
      throw new Error('Failed to upload video file');
    }

    // Publish video
    const publishResponse = await fetch(this.config.postUrl!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_id: videoId,
      }),
    });

    if (!publishResponse.ok) {
      throw new Error('Failed to publish video');
    }
  }
} 