import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { loggerFactory } from '../../infra/logger/pino-logger';

const logger = loggerFactory({
  prefix: 'Error Handler',
});

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const status = (err instanceof AppError && err.statusCode) ? err.statusCode : 500;
  const code = (err instanceof AppError && err.code) ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal Server Error';
  
  logger.error(`${status} - ${code} - ${message}`);
  
  res.status(status).json({
    message,
    code,
  });
  next(err);
}; 