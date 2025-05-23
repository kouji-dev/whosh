import { Request, Response, NextFunction } from 'express';

export const jsonBeautify = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body: any) {
    return originalJson.call(this, JSON.parse(JSON.stringify(body, null, 2)));
  };
  next();
}; 