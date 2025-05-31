import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { loggerFactory } from '../../infra/logger/pino-logger';
import { ZodError } from 'zod';

const logger = loggerFactory({
  prefix: 'Error Middleware',
});

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status: number;
  let code: string;
  let message: string;
  let issues: any = undefined;

  logger.warn('err', err);

  if (err instanceof ZodError) {
    status = 400;
    code = 'ZOD_VALIDATION_ERROR';
    message = err.message || 'Validation failed';
    issues = err.issues;
  } else {
    status = (err instanceof AppError && err.statusCode) ? err.statusCode : 500;
    code = (err instanceof AppError && err.code) ? err.code : 'INTERNAL_SERVER_ERROR';
    message = err.message || 'Internal Server Error';
  }

  logger.error(`${status} - ${code} - ${message}`);

  const responseBody: any = { message, code };
  if (issues) responseBody.issues = issues;

  res.status(status).json(responseBody);
  next(err);
}; 