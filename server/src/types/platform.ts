export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface PlatformUserInfo {
  id: string;
  username: string;
  name?: string;
  email?: string;
  profileImage?: string;
}

export interface PlatformEndpoints {
  posts: string;
  profile: string;
  media: string;
  analytics?: string;
}

export interface PlatformConfig {
  name: string;
  code: string;
  icon: string;
  getAuthUrl: (redirectUri: string) => string;
  handleCallback: (code: string, redirectUri: string) => Promise<OAuthTokens>;
  refreshToken: (refreshToken: string) => Promise<OAuthTokens>;
  validateToken: (accessToken: string) => Promise<boolean>;
  getEndpoints: (accessToken: string) => PlatformEndpoints;
  syncData: (accessToken: string) => Promise<any>;
} 