import { Router } from 'express';
import { AuthService } from '../application/auth-service.js';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '@skill-map/contracts';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  router.post('/register', asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.issues });
      return;
    }
    const result = await authService.register(parsed.data.email, parsed.data.password, parsed.data.name, parsed.data.role);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error.message });
      return;
    }
    sendCreated(res, { id: result.value.id.toString(), email: result.value.email, name: result.value.name, role: result.value.role });
  }));

  router.post('/login', asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    const result = await authService.login(parsed.data.email, parsed.data.password, req.headers['user-agent'], req.ip);
    if (!result.success) {
      res.status(401).json({ success: false, error: result.error.message });
      return;
    }
    sendSuccess(res, {
      accessToken: result.value.accessToken,
      refreshToken: result.value.refreshToken,
      expiresIn: result.value.expiresIn,
      user: { id: result.value.user.id.toString(), email: result.value.user.email, name: result.value.user.name, role: result.value.user.role },
    });
  }));

  router.post('/refresh', asyncHandler(async (req, res) => {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    const result = await authService.refresh(parsed.data.refreshToken);
    if (!result.success) {
      res.status(401).json({ success: false, error: result.error.message });
      return;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/logout', authenticate, asyncHandler(async (req, res) => {
    if (req.user) {
      await authService.logout(req.user.userId, req.body?.refreshToken);
    }
    sendSuccess(res, { message: 'Logged out' });
  }));

  router.get('/me', authenticate, asyncHandler(async (req, res) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }
    sendSuccess(res, req.user);
  }));

  return router;
}
