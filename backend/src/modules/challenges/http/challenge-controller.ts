import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';

export function createChallengeRouter(service: any): Router {
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

  router.get('/mine/submissions', authenticate, asyncHandler(async (req, res) => {
    const result = await service.mySubmissions(req.user!.userId);
    sendSuccess(res, result);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: 'Challenge not found' });
    sendSuccess(res, result);
  }));

  router.post('/:id/submit', authenticate, asyncHandler(async (req, res) => {
    const result = await service.submit(req.params.id, req.user!.userId, req.body);
    if (!result.success) return res.status(400).json({ success: false, error: result.error });
    sendCreated(res, result.value);
  }));

  router.post('/:id/submissions/:submissionId/evaluate', authenticate, asyncHandler(async (req, res) => {
    const result = await service.evaluate(req.params.id, req.params.submissionId, req.body, req.user!.userId);
    if (!result.success) return res.status(400).json({ success: false, error: result.error });
    sendSuccess(res, result.value);
  }));

  return router;
}
