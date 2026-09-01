import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendError(res: Response, error: string, statusCode = 400, details?: unknown): Response {
  return res.status(statusCode).json({ success: false, error, details });
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
