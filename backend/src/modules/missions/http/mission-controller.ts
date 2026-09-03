import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';

export function createMissionRouter(service: any): Router {
  const router = Router();

  router.get('/mine', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getMissionsForStudent(req.user!.userId);
    sendSuccess(res, result);
  }));

  router.post('/generate', authenticate, asyncHandler(async (req, res) => {
    const result = await service.generateMissions(req.user!.userId, req.body.gaps || [], req.body.orgId || '');
    sendCreated(res, result);
  }));

  router.post('/:competencyId/advance', authenticate, asyncHandler(async (req, res) => {
    const result = await service.advanceMission(req.user!.userId, req.params.competencyId);
    sendSuccess(res, result);
  }));

  return router;
}
