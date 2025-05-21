import { Request, Response, NextFunction } from 'express';
import config from '../config';

export const jsonBeautify = (req: Request, res: Response, next: NextFunction) => {
  // Only beautify in development mode
  if (config.server.nodeEnv !== 'development') {
    return next();
  }

  // Store the original json method
  const originalJson = res.json;

  // Override the json method
  res.json = function (body: any) {
    const beautified = JSON.stringify(body, null, 2);
    
    // Log the response in development
    console.log('\nResponse:', beautified, '\n');

    return originalJson.call(this, body)
  };

  return next();
}; 