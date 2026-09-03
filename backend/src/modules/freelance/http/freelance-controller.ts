import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';

export function createFreelanceRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.list(req.query);
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.create(req.body, req.user!.userId);
    if (!result.success) return res.status(400).json({ success: false, error: result.error });
    sendCreated(res, result.value);
  }));

  router.get('/matched', authenticate, asyncHandler(async (req, res) => {
    const skills = (req.query.skills as string) ? JSON.parse(req.query.skills as string) : [];
    const result = await service.matchForStudent(skills, Number(req.query.limit) || 10);
    sendSuccess(res, result);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: 'Task not found' });
    sendSuccess(res, result);
  }));

  router.post('/:id/apply', authenticate, asyncHandler(async (req, res) => {
    const result = await service.apply(req.params.id, req.user!.userId);
    if (!result.success) return res.status(400).json({ success: false, error: result.error });
    sendCreated(res, result.value);
  }));

  return router;
}
