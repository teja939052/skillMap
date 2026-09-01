import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createMatchingRouter(service: any): Router {
  const router = Router();

  router.get('/opportunities', authenticate, asyncHandler(async (req, res) => {
    const result = await service.matchOpportunities(req.user!.userId, req.query);
    sendSuccess(res, result);
  }));

  router.get('/candidates/:opportunityId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.matchCandidates(req.params.opportunityId, req.query);
    sendSuccess(res, result);
  }));

  router.get('/gaps', authenticate, asyncHandler(async (req, res) => {
    const result = await service.analyzeGaps(req.user!.userId, req.query.targetRole);
    sendSuccess(res, result);
  }));

  return router;
}
