import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.types';
import { ValidationError } from '../../lib/errors';
import { BaseController } from '../../lib/base.controller';
import config from '../../config';
import { sendSseEventToClientId } from '../../infra/sse/sse';
import { getClientIdFromRequest } from '../../infra/sse/sse.utils';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = AuthService.getInstance();
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await this.authService.register(validatedData);
      this.created(res, result);
    } catch (error) {
      if (error instanceof ValidationError) {
        this.clientError(res, error.message);
      } else {
        next(error);
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);
      this.ok(res, result);
    } catch (error) {
      if (error instanceof ValidationError) {
        this.clientError(res, error.message);
      } else {
        next(error);
      }
    }
  }

  async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      // Passport sets req.user on success
      const user = req.user;
      if (!user || typeof user !== 'object' || !('id' in user)) {
        const redirectUrl = `${config.server.clientUrl}/status?status=error&error=${encodeURIComponent('Authentication failed')}`;
        return res.redirect(redirectUrl);
      }
      // Generate JWT
      const token = this.authService.generateToken(user);
      // Use getClientIdFromRequest for all logic
      const clientId = getClientIdFromRequest(req, user.id);
      sendSseEventToClientId(clientId, 'google-auth-success', { user: { id: user.id, email: user.email }, token });
      const redirectUrl = `${config.server.clientUrl}/status?status=success`;
      res.redirect(redirectUrl);
    } catch (error) {
      const redirectUrl = `${config.server.clientUrl}/status?status=error&error=${encodeURIComponent('Authentication failed')}`;
      res.redirect(redirectUrl);
    }
  }

  async me(req: Request, res: Response) {
    res.json({ user: req.user });
  }
} 