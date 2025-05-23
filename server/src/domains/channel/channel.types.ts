import { PlatformCode } from '../../config/platforms';
import { socialChannels } from '../../db/schema';
import { InferSelectModel } from 'drizzle-orm';

export type Channel = InferSelectModel<typeof socialChannels>;

export interface CreateChannelDto {
  userId: string;
  platformId: PlatformCode;
  platformUserId: string;
  username: string;
  displayName?: string;
  profileImage?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpires?: Date;
  scopes: string[];
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateChannelDto {
  username?: string;
  displayName?: string;
  profileImage?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpires?: Date;
  scopes?: string[];
  isActive?: boolean;
  lastSync?: Date;
  metadata?: Record<string, any>;
}

export interface PlatformConnectionDto {
  platform: PlatformCode;
  redirectUri: string;
}

export interface PlatformCallbackDto {
  code: string;
  state: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  accountId: string;
}

export interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface ConnectionResult {
  success: boolean;
  redirectUrl: string;
  error?: string;
}

export interface PublishPostData {
  accessToken: string;
  content: string;
  mediaUrls: string[];
  metadata?: Record<string, any>;
} 