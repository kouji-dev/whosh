import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { dbClient } from '../lib/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import config from '../config';

const GOOGLE_CLIENT_ID = config.google.clientId || '';
const GOOGLE_CLIENT_SECRET = config.google.clientSecret || '';
const JWT_SECRET = config.jwt.secret || 'your-secret-key';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await dbClient.query.users.findFirst({
          where: eq(users.id, payload.userId),
        });
        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await dbClient.query.users.findFirst({
          where: eq(users.email, profile.emails?.[0].value || ''),
        });
        if (!user) {
          const [createdUser] = await dbClient.insert(users).values({
            email: profile.emails?.[0].value || '',
            name: profile.displayName,
            password: '', // Empty password for OAuth users
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();
          user = createdUser;
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport; 