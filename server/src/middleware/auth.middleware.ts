import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { type User as U} from '@prisma/client';

const authService = new AuthService();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends U {}
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }

    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
}; 