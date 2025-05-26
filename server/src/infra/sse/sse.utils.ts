import { Request } from 'express';
import { logger } from '../../infra/logger/pino-logger';

export function getClientIdFromRequest(req: Request, fallbackId?: string): string {
  // Prefer clientId from state if present
  if (typeof req.query.state === 'string') {
    try {
      const stateObj = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
      if (stateObj && stateObj.clientId) {
        logger.info('getClientIdFromRequest: stateObj.clientId:', stateObj.clientId);
        return stateObj.clientId;
      }
    } catch (e) {
      // ignore, fallback below
    }
  }
  logger.info('getClientIdFromRequest:', req.cookies?.tikk_client_id || req.query.clientId || fallbackId);
  return req.cookies?.tikk_client_id || req.query.clientId || fallbackId;
} 