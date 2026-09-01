import { Router } from 'express';
import { asyncHandler, authenticate, requireRole } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createAnalyticsRouter(service: any): Router {
  const router = Router();

  router.get('/student/:userId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getStudentDashboard(req.params.userId, req.query.competencies || []);
    sendSuccess(res, result);
  }));

  router.get('/institution', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getInstitutionDashboard(req.query);
    sendSuccess(res, result);
  }));

  router.get('/industry', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getIndustryDashboard(req.query);
    sendSuccess(res, result);
  }));

  router.get('/gaps', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getSkillGaps(req.query.institutionId, req.query.requirements);
    sendSuccess(res, result);
  }));

  router.get('/outcomes/:interventionId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getInterventionOutcomes(req.params.interventionId);
    sendSuccess(res, result);
  }));

  router.get('/demand', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getDemandSignals(req.query.region);
    sendSuccess(res, result);
  }));

  return router;
}
