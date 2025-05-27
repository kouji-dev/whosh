import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infra/logger/pino-logger';

export const jsonBeautify = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body: any) {
    logger.info('API Response:', body);
    if (body && typeof body === 'object' && !('data' in body) && !('message' in body && 'code' in body)) {
      return originalJson.call(this, { data: body });
    }
    return originalJson.call(this, body);
  };
  next();
}; 