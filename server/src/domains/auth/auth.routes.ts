import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../lib/middleware/validation.middleware';
import { registerSchema, loginSchema } from './auth.types';
import passport from 'passport';
import { authenticate } from '../../lib/middleware/auth.middleware';
import { logger } from '../../infra/logger/pino-logger';

const router = Router();
const authController = new AuthController();

// Register new user
router.post('/register', validate(registerSchema), authController.register.bind(authController));

// Login user
router.post('/login', validate(loginSchema), authController.login.bind(authController));

// Google OAuth login
router.get('/google', (req, res, next) => {
  logger.info('Google Login: cookies:', req.cookies);
  const clientId = req.cookies?.tikk_client_id;
  logger.info('Google Login: clientId:', clientId);
  const state = Buffer.from(JSON.stringify({ clientId })).toString('base64');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), authController.googleAuthCallback.bind(authController));

// Example protected route
router.get('/me', authenticate, authController.me.bind(authController));

export default router; 