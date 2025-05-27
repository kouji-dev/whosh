import pino from 'pino';
import { ILogger, LoggerContext } from './logger.interface';

function createLogger(context: LoggerContext = {}): ILogger {
  const pinoLogger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
    ...context,
  });

  function formatMessage(prefix: string | undefined, message: string) {
    return prefix ? `[${prefix}] ${message}` : message;
  }

  function mergeMeta(meta: unknown[]): object | undefined {
    if (!meta.length) return {};
    if (meta.length === 1 && typeof meta[0] === 'object') return meta[0] as object;
    return { meta };
  }

  const logger: ILogger = {
    info: (message, ...meta) => pinoLogger.info(mergeMeta(meta), formatMessage(context.prefix, message)),
    warn: (message, ...meta) => pinoLogger.warn(mergeMeta(meta), formatMessage(context.prefix, message)),
    error: (message, ...meta) => pinoLogger.error(mergeMeta(meta), formatMessage(context.prefix, message)),
    debug: (message, ...meta) => pinoLogger.debug(mergeMeta(meta), formatMessage(context.prefix, message)),
    child: (childContext: LoggerContext) => createLogger({ ...context, ...childContext }),
  };

  return logger;
}

export const loggerFactory = createLogger;
export const logger = loggerFactory(); 