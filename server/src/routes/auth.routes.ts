import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import passport from 'passport';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Password authentication routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback.bind(authController)
);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router; 