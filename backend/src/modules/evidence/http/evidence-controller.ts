import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createEvidenceRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.list(req.user!.userId, req.query);
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.create(req.body, req.user!.userId);
    sendSuccess(res, result, 201);
  }));

  router.post('/:id/verify', authenticate, asyncHandler(async (req, res) => {
    const result = await service.verify(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, result);
  }));

  router.get('/stats/me', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getStats(req.user!.userId);
    sendSuccess(res, result);
  }));

  router.get('/trust/me', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getTrustScores(req.user!.userId);
    sendSuccess(res, result);
  }));

  return router;
}
