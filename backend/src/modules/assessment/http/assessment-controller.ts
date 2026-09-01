import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess, sendCreated } from '../../../shared/http/response.js';

export function createAssessmentRouter(service: any): Router {
  const router = Router();

  router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.listAssessments({
      status: req.query.status as string,
      isPublished: req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined,
      competencyId: req.query.competencyId as string,
      orgId: req.orgId!,
    });
    sendSuccess(res, result);
  }));

  router.post('/', authenticate, asyncHandler(async (req, res) => {
    const result = await service.createAssessment(req.body, req.user!.userId);
    sendCreated(res, result);
  }));

  router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const includeAnswers = req.query.includeAnswers === 'true';
    const result = await service.getById(req.params.id, includeAnswers);
    sendSuccess(res, result);
  }));

  router.patch('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.updateAssessment(req.params.id, req.body);
    sendSuccess(res, result);
  }));

  router.post('/:id/publish', authenticate, asyncHandler(async (req, res) => {
    const result = await service.publishAssessment(req.params.id);
    sendSuccess(res, result);
  }));

  router.post('/:id/questions', authenticate, asyncHandler(async (req, res) => {
    const result = await service.addQuestion(req.params.id, req.body);
    sendCreated(res, result);
  }));

  router.delete('/:id/questions/:questionId', authenticate, asyncHandler(async (req, res) => {
    const result = await service.removeQuestion(req.params.id, req.params.questionId);
    sendSuccess(res, result);
  }));

  router.post('/:id/start', authenticate, asyncHandler(async (req, res) => {
    const result = await service.startAttempt(req.params.id, req.user!.userId);
    sendCreated(res, result);
  }));

  router.post('/attempts/:attemptId/submit', authenticate, asyncHandler(async (req, res) => {
    const result = await service.submitAttempt(req.params.attemptId, req.body);
    sendSuccess(res, result);
  }));

  router.get('/attempts/my', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getAttemptHistory(req.user!.userId, req.query.assessmentId as string);
    sendSuccess(res, result);
  }));

  router.get('/attempts/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getAttemptById(req.params.id);
    sendSuccess(res, result);
  }));

  router.get('/scores/my', authenticate, asyncHandler(async (req, res) => {
    const result = await service.getCompetencyScores(req.user!.userId);
    sendSuccess(res, result);
  }));

  router.get('/question-bank/:competencyId', authenticate, asyncHandler(async (req, res) => {
    const count = parseInt(req.query.count as string) || 10;
    const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string) : undefined;
    const result = await service.getQuestionsFromBank(req.params.competencyId, count, difficulty, req.orgId);
    sendSuccess(res, result);
  }));

  return router;
}
