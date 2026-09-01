import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';
import { InstitutionService } from '../application/institution-service.js';
import { createStudentImportRouter } from './student-import-controller.js';
import { StudentImportService } from '../application/student-import.service.js';
import { StudentRecordRepository } from '../infrastructure/student-record.repository.js';

export function createInstitutionRouter(
  service: InstitutionService,
  importService?: StudentImportService,
  recordRepo?: StudentRecordRepository,
): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listDepartments(req.query.orgId as string);
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createInstitution(req.body, req.user!.userId);
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
    const result = await service.update(req.params.id, req.body, req.user!.userId);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.get('/:id/departments', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listDepartments(req.params.id);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/departments', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createDepartment({ ...req.body, institutionId: req.params.id });
    if (!result.success) {
      throw result.error;
    }
    sendCreated(res, result.value);
  }));

  router.get('/:id/programs', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listPrograms(req.params.id);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/programs', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createProgram({ ...req.body, institutionId: req.params.id });
    if (!result.success) {
      throw result.error;
    }
    sendCreated(res, result.value);
  }));

  router.get('/:id/curricula', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listPrograms(req.params.id);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/curricula', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createCurriculum({ ...req.body, institutionId: req.params.id });
    if (!result.success) {
      throw result.error;
    }
    sendCreated(res, result.value);
  }));

  router.post('/:id/curricula/map', authenticate, asyncHandler(async (req, res) => {
    const result = await service.mapCompetencyToCurriculum(req.body);
    if (!result.success) {
      throw result.error;
    }
    sendCreated(res, result.value);
  }));

  router.get('/:id/cohorts', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listCohorts(req.params.id);
    if (!result.success) {
      throw result.error;
    }
    sendSuccess(res, result.value);
  }));

  router.post('/:id/cohorts', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createCohort({ ...req.body, institutionId: req.params.id });
    if (!result.success) {
      throw result.error;
    }
    sendCreated(res, result.value);
  }));

  if (importService && recordRepo) {
    router.use('/:id/students', createStudentImportRouter(importService, recordRepo));
  }

  return router;
}
