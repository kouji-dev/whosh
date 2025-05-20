export const platforms = {
  instagram: {
    name: 'Instagram',
    code: 'instagram',
    icon: 'instagram',
    authType: 'oauth2',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'],
    apiVersion: 'v18.0',
  },
  facebook: {
    name: 'Facebook',
    code: 'facebook',
    icon: 'facebook',
    authType: 'oauth2',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    apiVersion: 'v18.0',
  },
  tiktok: {
    name: 'TikTok',
    code: 'tiktok',
    icon: 'tiktok',
    authType: 'oauth2',
    scopes: ['user.info.basic', 'video.publish', 'video.list'],
    apiVersion: 'v2',
  },
  youtube: {
    name: 'YouTube',
    code: 'youtube',
    icon: 'youtube',
    authType: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
    apiVersion: 'v3',
  },
} as const;

export type PlatformCode = keyof typeof platforms; 