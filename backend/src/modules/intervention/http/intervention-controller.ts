import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createInterventionRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listInterventions({
      status: req.query.status as string,
      type: req.query.type as string,
      competencyId: req.query.competencyId as string,
      orgId: req.orgId!,
    });
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createIntervention(req.body, req.user!.userId);
    sendSuccess(res, result, 201);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/:id/publish', authenticate, asyncHandler(async (req, res) => {
    const result = await service.publishIntervention(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/:id/complete', authenticate, asyncHandler(async (req, res) => {
    const result = await service.completeIntervention(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/:id/cancel', authenticate, asyncHandler(async (req, res) => {
    const result = await service.cancelIntervention(req.params.id);
    sendSuccess(res, result);
  }));

  router.get('/:id/enrollments', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getEnrollments(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/:id/enroll', authenticate, asyncHandler(async (req, res) => {
    const result = await service.enrollStudent(req.params.id, req.body.studentId);
    sendSuccess(res, result, 201);
  }));

  router.patch('/:id/enrollments/:enrollmentId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.updateEnrollmentStatus(req.params.enrollmentId, req.body);
    sendSuccess(res, result);
  }));

  router.get('/:id/outcomes', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getOutcomes(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/:id/outcomes', authenticate, asyncHandler(async (req, res) => {
    const result = await service.recordOutcome({ ...req.body, orgId: req.orgId! });
    sendSuccess(res, result, 201);
  }));

  return router;
}
