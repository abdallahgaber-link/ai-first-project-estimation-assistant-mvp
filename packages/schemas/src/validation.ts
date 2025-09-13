import { z } from 'zod';
import { WBSSchema } from './wbs.schema';
import { EstimationSchema } from './estimation.schema';

export class ValidationError extends Error {
  public readonly errors: z.ZodIssue[];

  constructor(message: string, errors: z.ZodIssue[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  public getFormattedErrors(): string {
    return this.errors
      .map(error => `${error.path.join('.')}: ${error.message}`)
      .join('\n');
  }
}

// Removed unused validateWithSchema function

export function validateWBS(data: unknown): any {
  return WBSSchema.parse(data);
}

export function validateEstimation(data: unknown): any {
  return EstimationSchema.parse(data);
}

export function validatePartialWBS(data: unknown): any {
  return WBSSchema.partial().parse(data);
}

export function validatePartialEstimation(data: unknown): any {
  return EstimationSchema.partial().parse(data);
}
