import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
// import { format } from 'date-fns';

interface LogMetadata {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  provider?: string;
  model?: string;
  tokens?: number;
  latency?: number;
  retryCount?: number;
  errorCode?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

class LoggerService {
  private logger: winston.Logger;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const logEntry = {
          timestamp,
          level,
          message,
          ...meta
        };
        return JSON.stringify(logEntry);
      })
    );

    const transports: winston.transport[] = [];

    // Console transport for development
    if (!this.isProduction) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} [${level}]: ${message}${metaStr}`;
            })
          )
        })
      );
    }

    // File transport for all environments
    if (process.env.FILE_LOGGING === 'true') {
      // Daily rotate file for all logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
          level: 'info'
        })
      );

      // Separate file for errors
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: logFormat,
          level: 'error'
        })
      );

      // Separate file for API calls
      transports.push(
        new DailyRotateFile({
          filename: 'logs/api-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          format: logFormat,
          level: 'debug'
        })
      );
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  // General logging methods
  public info(message: string, meta?: LogMetadata): void {
    this.logger.info(message, this.sanitizeMeta(meta));
  }

  public error(message: string, error?: Error, meta?: LogMetadata): void {
    const errorMeta = {
      ...this.sanitizeMeta(meta),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.logger.error(message, errorMeta);
  }

  public warn(message: string, meta?: LogMetadata): void {
    this.logger.warn(message, this.sanitizeMeta(meta));
  }

  public debug(message: string, meta?: LogMetadata): void {
    this.logger.debug(message, this.sanitizeMeta(meta));
  }

  // Specialized logging methods
  public logApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    meta?: LogMetadata
  ): void {
    this.logger.info('API Request', {
      ...this.sanitizeMeta(meta),
      type: 'api_request',
      method,
      endpoint,
      statusCode,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  public logLLMCall(
    provider: string,
    model: string,
    tokens: number,
    latency: number,
    success: boolean,
    retryCount: number = 0,
    meta?: LogMetadata
  ): void {
    this.logger.info('LLM API Call', {
      ...this.sanitizeMeta(meta),
      type: 'llm_call',
      provider,
      model,
      tokens,
      latency,
      success,
      retryCount,
      timestamp: new Date().toISOString()
    });
  }

  public logEstimationRequest(
    projectTitle: string,
    modules: number,
    complexity: string,
    duration: number,
    meta?: LogMetadata
  ): void {
    this.logger.info('Estimation Request', {
      ...this.sanitizeMeta(meta),
      type: 'estimation_request',
      projectTitle: this.truncateString(projectTitle, 100),
      modules,
      complexity,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  public logExportRequest(
    format: string,
    projectTitle: string,
    success: boolean,
    duration: number,
    meta?: LogMetadata
  ): void {
    this.logger.info('Export Request', {
      ...this.sanitizeMeta(meta),
      type: 'export_request',
      format,
      projectTitle: this.truncateString(projectTitle, 100),
      success,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  public logUserAction(
    action: string,
    details?: any,
    meta?: LogMetadata
  ): void {
    this.logger.info('User Action', {
      ...this.sanitizeMeta(meta),
      type: 'user_action',
      action,
      details: this.sanitizeDetails(details),
      timestamp: new Date().toISOString()
    });
  }

  public logSystemEvent(
    event: string,
    details?: any,
    meta?: LogMetadata
  ): void {
    this.logger.info('System Event', {
      ...this.sanitizeMeta(meta),
      type: 'system_event',
      event,
      details: this.sanitizeDetails(details),
      timestamp: new Date().toISOString()
    });
  }

  // Utility methods
  private sanitizeMeta(meta?: LogMetadata): LogMetadata {
    if (!meta) return {};

    const sanitized = { ...meta };

    // Remove or mask sensitive information
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '***MASKED***';
      }
    });

    // Truncate long strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = this.truncateString(sanitized[key], 1000);
      }
    });

    return sanitized;
  }

  private sanitizeDetails(details?: any): any {
    if (!details) return undefined;

    if (typeof details === 'string') {
      return this.truncateString(details, 500);
    }

    if (typeof details === 'object') {
      const sanitized = { ...details };
      
      // Truncate large objects
      const stringified = JSON.stringify(sanitized);
      if (stringified.length > 2000) {
        return this.truncateString(stringified, 2000);
      }

      return sanitized;
    }

    return details;
  }

  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }

  // Performance monitoring
  public startTimer(label: string): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`Timer: ${label}`, { duration, type: 'performance' });
      return duration;
    };
  }

  // Health check logging
  public logHealthCheck(status: 'healthy' | 'unhealthy', details?: any): void {
    const level = status === 'healthy' ? 'info' : 'warn';
    this.logger.log(level, 'Health Check', {
      type: 'health_check',
      status,
      details: this.sanitizeDetails(details),
      timestamp: new Date().toISOString()
    });
  }

  // Graceful shutdown
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.end(() => {
        resolve();
      });
    });
  }
}

// Export singleton instance
export const logger = new LoggerService();
export default logger;
