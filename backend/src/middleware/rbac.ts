import type { Request, Response, NextFunction } from 'express';
import { ROLE_PERMISSIONS } from '@skill-map/config';
import { sendError } from '../utils/response.js';

export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] ?? [];

    if (userPermissions.includes('*')) {
      next();
      return;
    }

    const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasPermission) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Insufficient role', 403);
      return;
    }

    next();
  };
}
