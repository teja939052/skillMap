import type { Response } from 'express';
import type { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: ApiResponse<T>['meta']): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendError(res: Response, error: string, statusCode = 400, message?: string): Response {
  const response: ApiResponse = {
    success: false,
    error,
  };
  if (message) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
}
