import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../domains/auth/auth.service';
import { AuthenticationError } from '../errors';
import type { User } from '../../domains/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError('No authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new AuthenticationError('Invalid authorization format');
    }

    const authService = AuthService.getInstance();
    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}; 