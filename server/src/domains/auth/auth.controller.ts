import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, googleAuthSchema } from './auth.types';
import { ValidationError } from '../../lib/errors';
import { BaseController } from '../../lib/controllers/base.controller';

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

  async handleGoogleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = googleAuthSchema.parse(req.body);
      const result = await this.authService.handleGoogleAuth(validatedData);
      this.ok(res, result);
    } catch (error) {
      if (error instanceof ValidationError) {
        this.clientError(res, error.message);
      } else {
        next(error);
      }
    }
  }
} 