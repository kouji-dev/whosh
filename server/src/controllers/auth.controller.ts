import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  // Register with email and password
  async register(req: Request, res: Response) {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  // Login with email and password
  async login(req: Request, res: Response) {
    try {
      const { user, token } = await authService.login(req.body);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  // Google OAuth callback
  async googleCallback(req: Request, res: Response) {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      const { token } = await authService.handleGoogleAuth(req.user!);
      // Redirect to frontend with token as query param
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error(error);
      res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }

      const user = await authService.verifyToken(token);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }
} 