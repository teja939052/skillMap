import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';
import { RoleBlueprintService } from '../application/role-blueprint-service.js';

export function createRoleBlueprintRouter(service: RoleBlueprintService): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listBlueprints(req.query as any);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createBlueprint(req.body, req.user!.userId);
    if (!result.success) {
      throw result.error;
    }
    sendCreated(res, result.value);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getById(req.params.id);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.patch('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.updateBlueprint(req.params.id, req.body, req.user!.userId);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/publish', authenticate, asyncHandler(async (req, res) => {
    const result = await service.publishBlueprint(req.params.id, req.user!.userId);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/archive', authenticate, asyncHandler(async (req, res) => {
    const result = await service.archiveBlueprint(req.params.id, req.user!.userId);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/requirements', authenticate, asyncHandler(async (req, res) => {
    const result = await service.addRequirement(req.params.id, req.body, req.user!.userId);
    if (!result.success) {
      throw result.error;
    }
    sendCreated(res, result.value);
  }));

  router.delete('/:id/requirements/:competencyId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.removeRequirement(req.params.id, req.params.competencyId, req.user!.userId);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/match', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getMatchAnalysis(req.params.id, req.body.studentCompetencies ?? []);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  return router;
}
