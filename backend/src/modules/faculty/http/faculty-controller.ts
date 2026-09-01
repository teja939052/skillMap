import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';
import { FacultyService } from '../application/faculty-service.js';

export function createFacultyRouter(service: FacultyService): Router {
  const router = Router();

  router.get('/profile', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getProfile(req.user!.userId);
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error.message });
    }
    sendSuccess(res, result.value);
  }));

  router.post('/profile', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createProfile(req.body, req.user!.userId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendCreated(res, result.value);
  }));

  router.patch('/profile', authenticate, asyncHandler(async (req, res) => {
    const result = await service.updateProfile(req.user!.userId, req.body, req.user!.userId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendSuccess(res, result.value);
  }));

  router.get('/search', authenticate, asyncHandler(async (req, res) => {
    const competencyId = req.query.competencyId as string;
    const result = await service.searchByExpertise(competencyId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendSuccess(res, result.value);
  }));

  router.get('/research', authenticate, asyncHandler(async (req, res) => {
    const result = await service.searchByExpertise('');
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendSuccess(res, result.value);
  }));

  router.post('/research', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createResearchProject({ ...req.body, facultyId: req.user!.userId });
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendCreated(res, result.value);
  }));

  router.get('/mentorships', authenticate, asyncHandler(async (req, res) => {
    sendSuccess(res, []);
  }));

  router.post('/mentorships', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createMentorship(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendCreated(res, result.value);
  }));

  router.patch('/mentorships/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.updateMentorshipStatus(req.params.id, req.body.status);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendSuccess(res, result.value);
  }));

  router.get('/consultancy', authenticate, asyncHandler(async (req, res) => {
    sendSuccess(res, []);
  }));

  router.post('/consultancy', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createConsultancy(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendCreated(res, result.value);
  }));

  router.get('/fdp', authenticate, asyncHandler(async (req, res) => {
    sendSuccess(res, []);
  }));

  router.post('/fdp', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createFDP(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.message });
    }
    sendCreated(res, result.value);
  }));

  return router;
}
