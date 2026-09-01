import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '@skill-map/contracts';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', validate(refreshTokenSchema), async (req, res, next) => {
  try {
    const result = await AuthService.refresh(req.body.refreshToken);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await AuthService.logout(req.user!.userId, req.body?.refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const profile = await AuthService.getProfile(req.user!.userId);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
});

router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    await AuthService.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword);
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
