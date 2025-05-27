import { BasePlatformHandler } from './platform-handler.base';
import { OAuthTokens, UserInfo, ConnectionResult, PublishPostData, CreateChannelDto } from '../channel.types';
import { platforms } from '../../../config/platforms';
import { ChannelRepository } from '../channel.repository';
import { logger } from '../../../infra/logger/pino-logger';
import fs from 'fs';
import path from 'path';
import { LocalStorageService } from '../../../infra/storage/storage.service';
import { AttachmentService } from '../../attachment/attachment.service';

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
  private readonly attachmentService: AttachmentService;

  constructor() {
    super('tiktok');
    this.channelRepository = ChannelRepository.getInstance();
    this.attachmentService = AttachmentService.getInstance();
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
    logger.info('TikTok auth response:', data);
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      accountId: data.open_id,
    };
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    // TikTok API requires 'fields' query parameter
    const fields = [
      'open_id',
      'union_id',
      'avatar_url',
      'avatar_url_100',
      'avatar_large_url',
      'display_name',
      'bio_description',
      'is_verified',
      'username',
      'follower_count',
      'following_count',
      'likes_count',
      'video_count',
    ].join(',');
    const url = `${this.config.userInfoUrl}?fields=${fields}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Failed to get user info:', errorText);
      throw new Error('Failed to get user info');
    }

    const data = await response.json() as any;
    // Defensive: check structure
    if (!data?.data?.user) {
      logger.error('TikTok user info missing user object:', data);
      throw new Error('TikTok user info missing user object');
    }
    const user = data.data.user;
    logger.info('TikTok user info:', user);
    return {
      id: user.open_id,
      username: user.username || user.unique_id || '',
      displayName: user.display_name || '',
      avatarUrl: user.avatar_url || '',
      // For future: add more fields to UserInfo and map here as needed
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
        redirectUrl: `${clientUrl}/dashboard/channels?success=true`,
      };
    } catch (error) {
      return {
        success: false,
        redirectUrl: `${clientUrl}/dashboard/channels?error=connection_failed`,
        error: error.message,
      };
    }
  }

  async publishPost(data: PublishPostData): Promise<void> {
    // 1. Get the local file path from the first attachment
    const postId = data.postId;
    if (!postId) throw new Error('postId is required for TikTok upload');
    const attachments = await this.attachmentService.findByPostId(postId);
    if (!attachments.length) throw new Error('No attachments found for this post');
    const localFilePath = attachments[0].path;
    logger.info('TikTok local file path:', localFilePath);
    const fileSize = fs.statSync(localFilePath).size;
    // 2. Initiate direct post with TikTok
    const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: data.content,
          privacy_level: 'SELF_ONLY', // required for unaudited clients
          // Optionally: disable_duet, disable_comment, disable_stitch, video_cover_timestamp_ms, etc.
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: fileSize,
          chunk_size: fileSize,
          total_chunk_count: 1
        }
      }),
    });
    if (!initRes.ok) {
      const errText = await initRes.text();
      logger.error('TikTok init upload failed', { errText });
      throw new Error('Failed to initiate TikTok upload');
    }
    const initData: any = await initRes.json();
    if (!initData?.data?.upload_url || !initData?.data?.publish_id) {
      logger.error('TikTok init upload missing fields', { initData });
      throw new Error('TikTok init upload response missing upload_url or publish_id');
    }
    const { upload_url, publish_id } = initData.data;
    // 3. Upload the file
    const fileStream = fs.createReadStream(localFilePath);
    const uploadRes = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes 0-${fileSize - 1}/${fileSize}`,
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
      },
      body: fileStream,
      duplex: 'half',
    });
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      logger.error('TikTok file upload failed', { errText });
      throw new Error('Failed to upload video file to TikTok');
    }
    // 4. Check the status of the post
    const statusRes = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publish_id }),
    });
    if (!statusRes.ok) {
      const errText = await statusRes.text();
      logger.error('TikTok status fetch failed', { errText });
      throw new Error('Failed to fetch TikTok post status');
    }
    const statusData = await statusRes.json();
    logger.info('TikTok post status', { publish_id, status: statusData });
  }
} 