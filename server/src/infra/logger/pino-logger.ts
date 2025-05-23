import pino from 'pino';
import { ILogger } from './logger.interface';

const pinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

export const logger: ILogger = {
  info: (message, ...meta) => pinoLogger.info({ meta }, message),
  warn: (message, ...meta) => pinoLogger.warn({ meta }, message),
  error: (message, ...meta) => pinoLogger.error({ meta }, message),
  debug: (message, ...meta) => pinoLogger.debug({ meta }, message),
}; 