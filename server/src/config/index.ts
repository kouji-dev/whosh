import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('your-secret-key'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  API_URL: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_ID: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
});

const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  db: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  server: {
    nodeEnv: env.NODE_ENV,
    corsOrigin: env.CORS_ORIGIN,
    apiUrl: env.API_URL,
    clientUrl: env.FRONTEND_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  socialMedia: {
    twitter: {
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
    },
    facebook: {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    },
    instagram: {
      clientId: env.INSTAGRAM_CLIENT_ID,
      clientSecret: env.INSTAGRAM_CLIENT_SECRET,
    },
    linkedin: {
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    },
    tiktok: {
      clientId: env.TIKTOK_CLIENT_ID,
      clientSecret: env.TIKTOK_CLIENT_SECRET,
    },
    youtube: {
      clientId: env.YOUTUBE_CLIENT_ID,
      clientSecret: env.YOUTUBE_CLIENT_SECRET,
    },
  },
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
} as const;

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    { name: 'DATABASE_URL', value: config.db.url },
    { name: 'JWT_SECRET', value: config.jwt.secret },
    { name: 'API_URL', value: config.server.apiUrl },
    { name: 'FACEBOOK_CLIENT_ID', value: config.socialMedia.facebook.clientId },
    { name: 'FACEBOOK_CLIENT_SECRET', value: config.socialMedia.facebook.clientSecret },
    { name: 'TIKTOK_CLIENT_ID', value: config.socialMedia.tiktok.clientId },
    { name: 'TIKTOK_CLIENT_SECRET', value: config.socialMedia.tiktok.clientSecret },
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

export default config; 