import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../lib/middleware/validation.middleware';
import { registerSchema, loginSchema, googleAuthSchema } from './auth.types';

const router = Router();
const authController = new AuthController();

// Register new user
router.post('/register', validate(registerSchema), authController.register.bind(authController));

// Login user
router.post('/login', validate(loginSchema), authController.login.bind(authController));

// Google authentication
router.post('/google/callback', validate(googleAuthSchema), authController.handleGoogleAuth.bind(authController));

export default router; 