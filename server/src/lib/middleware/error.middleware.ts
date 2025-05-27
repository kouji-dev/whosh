import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../../infra/logger/pino-logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message, err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
    });
  }

  next();
}; 