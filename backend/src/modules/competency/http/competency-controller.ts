import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createCompetencyRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.list(req.query);
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.create(req.body, req.user!.userId);
    sendSuccess(res, result, 201);
  }));

  router.get('/tree', authenticate, asyncHandler(async (_req, res) => {
    const result = await service.getTree();
    sendSuccess(res, result);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    sendSuccess(res, result);
  }));

  return router;
}
