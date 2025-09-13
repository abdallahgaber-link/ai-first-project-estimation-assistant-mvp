import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const LOG_DIR = process.env.LOG_DIR || './logs';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Custom format for masking secrets
const maskSecrets = winston.format((info) => {
  const masked = { ...info };
  
  // Mask API keys and sensitive data
  if (masked.requestBody) {
    masked.requestBody = JSON.stringify(masked.requestBody).replace(
      /(api[_-]?key|token|secret|password)["']?\s*[:=]\s*["']?([^"',\s]{8})[^"',\s]*["']?/gi,
      '$1: "$2***"'
    );
  }
  
  if (masked.responseBody) {
    masked.responseBody = JSON.stringify(masked.responseBody).replace(
      /(api[_-]?key|token|secret|password)["']?\s*[:=]\s*["']?([^"',\s]{8})[^"',\s]*["']?/gi,
      '$1: "$2***"'
    );
  }
  
  return masked;
});

// Create logger instance
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    maskSecrets(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Daily rotate file for all logs
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Separate file for errors
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Utility functions
export const generateSessionId = (): string => {
  return crypto.randomBytes(4).toString('hex');
};

export const hashInput = (input: any): string => {
  return crypto.createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex')
    .substring(0, 16);
};

export const truncateBody = (body: any, maxLength: number = 4096): string => {
  const str = typeof body === 'string' ? body : JSON.stringify(body);
  return str.length > maxLength ? str.substring(0, maxLength) + '...[truncated]' : str;
};

// LLM Request Logger
export interface LLMLogEntry {
  timestamp: string;
  sessionId: string;
  provider: string;
  model: string;
  latencyMs: number;
  status: 'success' | 'error' | 'retry' | 'fallback';
  retryCount: number;
  inputHash: string;
  requestBody?: string;
  responseBody?: string;
  error?: string;
}

export const logLLMRequest = (entry: LLMLogEntry): void => {
  logger.info('LLM Request', {
    ...entry,
    requestBody: entry.requestBody ? truncateBody(entry.requestBody) : undefined,
    responseBody: entry.responseBody ? truncateBody(entry.responseBody) : undefined
  });
};
