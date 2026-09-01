import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimiter(maxRequests = 100, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      sendError(res, 'Too many requests', 429);
      return;
    }

    next();
  };
}

export function authRateLimiter(maxRequests = 5, windowMs = 300_000) {
  const authStore = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();

    const entry = authStore.get(key);

    if (!entry || now > entry.resetAt) {
      authStore.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      sendError(res, 'Too many authentication attempts. Try again later.', 429);
      return;
    }

    next();
  };
}
