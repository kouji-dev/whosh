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
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID,
    appSecret: process.env.INSTAGRAM_APP_SECRET,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    { name: 'DATABASE_URL', value: dbConfig.url },
    { name: 'JWT_SECRET', value: jwtConfig.secret },
    { name: 'GOOGLE_CLIENT_ID', value: googleConfig.clientId },
    { name: 'GOOGLE_CLIENT_SECRET', value: googleConfig.clientSecret },
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