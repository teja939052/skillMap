import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';

export function createSkillRequestRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.list(req.query);
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const institutionId = req.body.institutionId;
    const result = await service.create(req.body, req.user!.userId, institutionId);
    if (!result.success) return res.status(400).json({ success: false, error: result.error });
    sendCreated(res, result.value);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: 'Skill request not found' });
    sendSuccess(res, result);
  }));

  router.post('/:id/action', authenticate, asyncHandler(async (req, res) => {
    const result = await service.takeAction(req.params.id, req.body.action);
    if (!result.success) return res.status(400).json({ success: false, error: result.error });
    sendSuccess(res, result.value);
  }));

  return router;
}
