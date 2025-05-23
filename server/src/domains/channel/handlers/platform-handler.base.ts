import { PlatformCode } from '../../../config/platforms';
import { OAuthTokens, UserInfo, ConnectionResult, PublishPostData } from '../channel.types';

export abstract class BasePlatformHandler {
  protected readonly platformCode: PlatformCode;

  constructor(platformCode: PlatformCode) {
    this.platformCode = platformCode;
  }

  abstract getAuthUrl(redirectUri: string, userId: string): string;
  abstract handleCallback(code: string, redirectUri: string, state?: string): Promise<OAuthTokens>;
  abstract getUserInfo(accessToken: string): Promise<UserInfo>;
  abstract refreshToken(refreshToken: string): Promise<OAuthTokens>;
  abstract revokeToken(accessToken: string): Promise<void>;
  abstract handleConnection(userId: string, tokens: OAuthTokens, userInfo: UserInfo, clientUrl: string): Promise<ConnectionResult>;
  abstract publishPost(data: PublishPostData): Promise<void>;
} 