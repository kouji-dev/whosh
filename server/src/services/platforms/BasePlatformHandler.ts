import { PlatformHandler, OAuthTokens, UserInfo, ConnectionResult, PublishPostData } from './PlatformHandler';

export abstract class BasePlatformHandler implements PlatformHandler {
  protected constructor(protected readonly platformCode: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube') {}

  abstract getAuthUrl(redirectUri: string, userId: string): string;
  abstract handleCallback(code: string, redirectUri: string, state?: string): Promise<OAuthTokens>;
  abstract getUserInfo(accessToken: string): Promise<UserInfo>;
  abstract refreshToken(refreshToken: string): Promise<OAuthTokens>;
  abstract revokeToken(accessToken: string): Promise<void>;
  abstract handleConnection(userId: string, tokens: OAuthTokens, userInfo: UserInfo, clientUrl: string): Promise<ConnectionResult>;
  abstract publishPost(data: PublishPostData): Promise<void>;
} 