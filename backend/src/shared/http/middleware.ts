import { Request, Response, NextFunction } from 'express';
import { Result, DomainError, UnauthorizedError, ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../domain/result.js';
import { AuthPayload } from '../../modules/identity/application/auth-service.js';
import { verifyAccessToken } from '../../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      orgId?: string;
      traceId?: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  req.traceId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  try {
    const payload = verifyAccessToken(token) as unknown as AuthPayload;
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function handleError(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ success: false, error: err.message, code: (err as any).code, details: (err as any).details });
    return;
  }
  if (err instanceof UnauthorizedError) {
    res.status(401).json({ success: false, error: err.message, code: (err as any).code });
    return;
  }
  if (err instanceof ForbiddenError) {
    res.status(403).json({ success: false, error: err.message, code: (err as any).code });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ success: false, error: err.message, code: (err as any).code });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ success: false, error: err.message, code: (err as any).code });
    return;
  }
  if (err instanceof DomainError) {
    res.status(400).json({ success: false, error: err.message, code: (err as any).code });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
