import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';

export function createNotificationRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listForUser(req.user!.userId, {
      limit: Number(req.query.limit) || 50,
      unreadOnly: req.query.unread === 'true',
    });
    sendSuccess(res, result);
  }));

  router.get('/unread-count', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listForUser(req.user!.userId, { unreadOnly: true });
    sendSuccess(res, { count: result.unread });
  }));

  router.patch('/:id/read', authenticate, asyncHandler(async (req, res) => {
    const result = await service.markRead(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/read-all', authenticate, asyncHandler(async (req, res) => {
    const result = await service.markAllRead(req.user!.userId);
    sendSuccess(res, result);
  }));

  router.post('/test', authenticate, asyncHandler(async (req, res) => {
    const created = await service.pushForUser(req.user!.userId, {
      title: req.body.title || 'Test notification',
      body: req.body.body || 'This is a test notification',
      type: 'system',
      link: req.body.link,
    });
    sendCreated(res, { id: created.id.toString() });
  }));

  return router;
}
