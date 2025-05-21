import crypto from 'crypto';
import { PlatformHandler, OAuthTokens, UserInfo, ConnectionResult } from '../PlatformHandler';
import { platforms } from '../../../config/platforms';
import { socialMediaConfig } from '../../../config';
import { prisma } from '../../../lib/prisma';

// Add type definition for global TikTok verifiers
declare global {
  var tiktokVerifiers: Map<string, string> | undefined;
}

interface TikTokTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  open_id: string;
  scope: string;
  refresh_expires_in: number;
  token_type: string;
}

interface TikTokUserResponse {
  data: {
    user: {
      open_id: string;
      union_id: string;
      avatar_url: string;
      avatar_url_100: string;
      avatar_large_url: string;
      display_name: string;
      bio_description?: string;
      profile_deep_link: string;
      is_verified: boolean;
      username: string;
      follower_count: number;
      following_count: number;
      likes_count: number;
      video_count: number;
    }
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  }
}

interface TikTokMediaResponse {
  data: {
    media_id: string;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

export class TikTokHandler implements PlatformHandler {
  private readonly config = platforms.tiktok;
  private readonly clientId = socialMediaConfig.tiktok.clientId as string;
  private readonly clientSecret = socialMediaConfig.tiktok.clientSecret as string;

  private generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
    return { verifier, challenge };
  }

  getAuthUrl(redirectUri: string, userId: string): string {
    const scopes = this.config.scopes.join(',');
    // Create a state object that includes both the random state and userId
    const stateObj = {
      state: Math.random().toString(36).substring(2),
      userId
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
    const { verifier, challenge } = this.generatePKCE();

    const params = new URLSearchParams({
      client_key: this.clientId,
      response_type: 'code',
      scope: scopes,
      redirect_uri: redirectUri,
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });

    // Store the verifier for later use
    global.tiktokVerifiers = global.tiktokVerifiers || new Map();
    global.tiktokVerifiers.set(state, verifier);

    return `${this.config.authUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, redirectUri: string, state?: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      client_key: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    // Add code_verifier if state is provided
    if (state && global.tiktokVerifiers) {
      const verifier = global.tiktokVerifiers.get(state);
      if (verifier) {
        params.append('code_verifier', verifier);
        global.tiktokVerifiers.delete(state);
      }
    }

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Token exchange error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json() as TikTokTokenResponse;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresIn: data.expires_in,
      accountId: data.open_id
    };
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const fields = [
      'open_id',
      'username',
      'display_name',
      'avatar_url'
    ].join(',');

    const response = await fetch(`${this.config.userInfoUrl}?fields=${fields}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('User info error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const data = await response.json() as TikTokUserResponse;
    
    if (data.error?.code !== 'ok') {
      throw new Error(`TikTok API error: ${data.error.message}`);
    }

    const user = data.data.user;
    return {
      id: user.open_id,
      username: user.username || user.display_name || user.open_id,
      displayName: user.display_name,
      avatarUrl: user.avatar_url
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      client_key: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json() as TikTokTokenResponse;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresIn: data.expires_in,
      accountId: data.open_id
    };
  }

  async revokeToken(accessToken: string): Promise<void> {
    const params = new URLSearchParams({
      client_key: this.clientId,
      client_secret: this.clientSecret,
      token: accessToken
    });

    const response = await fetch('https://open.tiktokapis.com/v2/oauth/revoke/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to revoke token');
    }
  }

  async publishPost(data: { content: string; mediaUrls: string[]; accessToken: string }): Promise<void> {
    const { content, mediaUrls, accessToken } = data;

    // First, upload media if any
    const mediaIds = await Promise.all(
      mediaUrls.map(async (url) => {
        const response = await fetch(`${this.config.uploadUrl}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source: url,
            source_info: {
              source: 'FILE_UPLOAD'
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to upload media: ${response.statusText}`);
        }

        const data = await response.json() as TikTokMediaResponse;
        if (data.error) {
          throw new Error(`TikTok API error: ${data.error.message}`);
        }
        return data.data.media_id;
      })
    );

    // Then create the post
    const response = await fetch(`${this.config.postUrl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title: content,
          privacy_level: 'PUBLIC',
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false
        },
        media_ids: mediaIds
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }
  }

  async handleConnection(userId: string, tokens: OAuthTokens, userInfo: UserInfo, clientUrl: string): Promise<ConnectionResult> {
    try {
      // First, ensure the platform exists
      const platformRecord = await prisma.platform.upsert({
        where: { code: 'tiktok' },
        update: {},
        create: {
          code: 'tiktok',
          name: this.config.name,
          icon: this.config.icon,
          color: this.config.color
        }
      });

      // Save the connection
      await prisma.platformConnection.create({
        data: {
          userId,
          platformId: platformRecord.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accountId: tokens.accountId,
          accountName: userInfo.username,
          profileImage: userInfo.avatarUrl,
          scopes: this.config.scopes,
          isValid: true
        }
      });

      return {
        success: true,
        redirectUrl: `${clientUrl}/dashboard/channels?success=true`
      };
    } catch (error) {
      console.error('Failed to save TikTok connection:', error);
      return {
        success: false,
        redirectUrl: `${clientUrl}/dashboard/channels?error=connection_failed`,
        error: 'Failed to save connection'
      };
    }
  }
} 