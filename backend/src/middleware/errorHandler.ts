import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  if (err.name === 'MongoServerError' && (err as unknown as { code?: number }).code === 11000) {
    sendError(res, 'Duplicate key error', 409);
    return;
  }

  console.error('[Unhandled Error]', err);
  sendError(res, 'Internal server error', 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
}
