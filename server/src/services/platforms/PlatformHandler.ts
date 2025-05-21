import { PlatformCode } from '../../config/platforms';

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  accountId: string;
}

export interface UserInfo {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface ConnectionResult {
  success: boolean;
  redirectUrl: string;
  error?: string;
}

export interface PlatformHandler {
  getAuthUrl(redirectUri: string, userId: string): string;
  handleCallback(code: string, redirectUri: string, state?: string): Promise<OAuthTokens>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
  refreshToken(refreshToken: string): Promise<OAuthTokens>;
  revokeToken(accessToken: string): Promise<void>;
  handleConnection(userId: string, tokens: OAuthTokens, userInfo: UserInfo, clientUrl: string): Promise<ConnectionResult>;
} 