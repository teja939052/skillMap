import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[part]);
      req[part] = result;
      next();
    } catch (err) {
      const zodErr = err as ZodError;
      const issues = zodErr.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      sendError(res, 'Validation failed', 400, issues);
    }
  };
}
