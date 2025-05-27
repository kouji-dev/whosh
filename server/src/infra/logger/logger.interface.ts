export interface ILogger {
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
  debug(message: string, ...meta: unknown[]): void;
  child(context: LoggerContext): ILogger;
}

export interface LoggerContext {
  prefix?: string;
  [key: string]: unknown;
} 