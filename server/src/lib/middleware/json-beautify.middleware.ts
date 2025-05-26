import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infra/logger/pino-logger';

export const jsonBeautify = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body: any) {
    logger.info('API Response:', body);
    return originalJson.call(this, JSON.parse(JSON.stringify(body, null, 2)));
  };
  next();
}; 