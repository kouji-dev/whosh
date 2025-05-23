import { Response } from 'express';
import { AppError } from './errors';

export class BaseController {
  protected ok<T>(res: Response, dto?: T) {
    if (dto) {
      res.status(200).json(dto);
    } else {
      res.sendStatus(200);
    }
  }

  protected created<T>(res: Response, dto?: T) {
    if (dto) {
      res.status(201).json(dto);
    } else {
      res.sendStatus(201);
    }
  }

  protected noContent(res: Response): Response {
    return res.status(204).send();
  }

  protected clientError(res: Response, message?: string) {
    res.status(400).json({
      error: message || 'Bad Request',
    });
  }

  protected unauthorized(res: Response, message?: string) {
    res.status(401).json({
      error: message || 'Unauthorized',
    });
  }

  protected forbidden(res: Response, message?: string) {
    res.status(403).json({
      error: message || 'Forbidden',
    });
  }

  protected notFound(res: Response, message?: string) {
    res.status(404).json({
      error: message || 'Not Found',
    });
  }

  protected conflict(res: Response, message?: string) {
    res.status(409).json({
      error: message || 'Conflict',
    });
  }

  protected tooMany(res: Response, message?: string) {
    res.status(429).json({
      error: message || 'Too Many Requests',
    });
  }

  protected fail(res: Response, error: Error | string) {
    res.status(500).json({
      error: error instanceof Error ? error.message : error,
    });
  }
} 