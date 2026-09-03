import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createSkillGraphRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getGraph(req.query.domain as string | undefined);
    sendSuccess(res, result);
  }));

  router.get('/role/:roleId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getRoleTargets(req.params.roleId);
    sendSuccess(res, result);
  }));

  router.get('/missions/:userId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getLearningPath((req.query.skills as string | undefined)?.split(',') || [], req.query.targetRoleId as string | undefined || '');
    sendSuccess(res, result);
  }));

  router.post('/seed', asyncHandler(async (_req, res) => {
    const result = await service.seedDemoData('org-demo');
    sendSuccess(res, result, 201);
  }));

  return router;
}
