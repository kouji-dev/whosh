import config from './index';
const socialMedia = config.socialMedia;
export type PlatformCode = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube';

export interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  clientId: string;
  clientSecret: string;
  apiVersion?: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  uploadUrl?: string;
  postUrl?: string;
}

export const platforms: Record<PlatformCode, PlatformConfig> = {
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    clientId: '',
    clientSecret: '',
    apiVersion: '2',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me'
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    clientId: socialMedia.facebook.clientId as string,
    clientSecret: socialMedia.facebook.clientSecret as string,
    apiVersion: 'v22.0',
    scopes: [
      'pages_show_list',
      'pages_manage_metadata',
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_manage_engagement'
    ],
    authUrl: 'https://www.facebook.com/v22.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v22.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/v22.0/me'
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: '#E4405F',
    clientId: '',
    clientSecret: '',
    apiVersion: 'v18.0',
    scopes: ['instagram_basic', 'instagram_content_publish'],
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    userInfoUrl: 'https://graph.instagram.com/me'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    clientId: '',
    clientSecret: '',
    scopes: ['r_liteprofile', 'w_member_social'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/me'
  },
  tiktok: {
    name: 'TikTok',
    icon: 'tiktok',
    color: '#000000',
    clientId: socialMedia.tiktok.clientId as string,
    clientSecret: socialMedia.tiktok.clientSecret as string,
    scopes: ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.publish', 'video.upload', 'video.list'],
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    userInfoUrl: 'https://open.tiktokapis.com/v2/user/info/',
    uploadUrl: 'https://open.tiktokapis.com/v2/post/publish/video/upload/',
    postUrl: 'https://open.tiktokapis.com/v2/post/publish/video/publish/'
  },
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    clientId: '',
    clientSecret: '',
    scopes: ['https://www.googleapis.com/auth/youtube'],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/youtube/v3/channels'
  }
}; 