import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../domains/auth/auth.service';
import { AuthenticationError } from '../errors';
import { associateUserIdWithClientId } from '../../infra/sse/sse';
import { getClientIdFromRequest } from '../../infra/sse/sse.utils';
import { logger } from '../../infra/logger/pino-logger';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // If the route is /sse, always use the token from the query param
    const authHeader = req.headers.authorization;
      if (authHeader) {
        const [type, t] = authHeader.split(' ');
        if (type === 'Bearer' && t) token = t;
      }

    if (!token) {
      throw new AuthenticationError('No authorization token');
    }

    const authService = AuthService.getInstance();
    const user = await authService.verifyToken(token);
    req.user = user;

    // Bind userId to clientId in SSE mapping if both are present
    const clientId = getClientIdFromRequest(req, user?.id);
    associateUserIdWithClientId(user.id, clientId);
  
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    next(error);
  }
}; 