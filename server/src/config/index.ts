import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Server configuration
export const serverConfig = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  apiUrl: process.env.API_URL,
  clientUrl: process.env.CLIENT_URL,
};

// Database configuration
export const dbConfig = {
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
};

// Redis configuration
export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

// JWT configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

// Google OAuth configuration
export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

// Social Media API configuration
export const socialMediaConfig = {
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  },
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    { name: 'DATABASE_URL', value: dbConfig.url },
    { name: 'JWT_SECRET', value: jwtConfig.secret },
    { name: 'API_URL', value: serverConfig.apiUrl },
    //{ name: 'CLIENT_URL', value: serverConfig.clientUrl },
    // Platform OAuth requirements
    // { name: 'TWITTER_CLIENT_ID', value: socialMediaConfig.twitter.clientId },
    // { name: 'TWITTER_CLIENT_SECRET', value: socialMediaConfig.twitter.clientSecret },
     { name: 'FACEBOOK_CLIENT_ID', value: socialMediaConfig.facebook.clientId },
     { name: 'FACEBOOK_CLIENT_SECRET', value: socialMediaConfig.facebook.clientSecret },
    // { name: 'INSTAGRAM_CLIENT_ID', value: socialMediaConfig.instagram.clientId },
    // { name: 'INSTAGRAM_CLIENT_SECRET', value: socialMediaConfig.instagram.clientSecret },
    // { name: 'LINKEDIN_CLIENT_ID', value: socialMediaConfig.linkedin.clientId },
    // { name: 'LINKEDIN_CLIENT_SECRET', value: socialMediaConfig.linkedin.clientSecret },
    // { name: 'TIKTOK_CLIENT_ID', value: socialMediaConfig.tiktok.clientId },
    // { name: 'TIKTOK_CLIENT_SECRET', value: socialMediaConfig.tiktok.clientSecret },
    // { name: 'YOUTUBE_CLIENT_ID', value: socialMediaConfig.youtube.clientId },
    // { name: 'YOUTUBE_CLIENT_SECRET', value: socialMediaConfig.youtube.clientSecret },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars
        .map(({ name }) => name)
        .join(', ')}`
    );
  }
};

// Validate configuration on startup
validateConfig();

export default {
  server: serverConfig,
  db: dbConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  google: googleConfig,
  socialMedia: socialMediaConfig,
}; 