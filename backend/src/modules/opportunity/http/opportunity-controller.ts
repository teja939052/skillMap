import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createOpportunityRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.list(req.query);
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.create(req.body, req.user!.userId);
    sendSuccess(res, result, 201);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/:id/publish', authenticate, asyncHandler(async (req, res) => {
    const result = await service.publish(req.params.id, req.user!.userId);
    sendSuccess(res, result);
  }));

  router.post('/:id/apply', authenticate, asyncHandler(async (req, res) => {
    const result = await service.apply(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, result, 201);
  }));

  router.get('/:id/applications', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getApplications(req.params.id, req.query);
    sendSuccess(res, result);
  }));

  return router;
}
