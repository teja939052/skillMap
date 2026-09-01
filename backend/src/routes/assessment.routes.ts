import { Router } from 'express';
import { AssessmentService } from '../services/assessment.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { assessmentSchema, assessmentAttemptSchema, paginationSchema } from '@skill-map/contracts';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await AssessmentService.list(page, limit, true);
    sendSuccess(res, result.items, 200, { page, limit, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(assessmentSchema), async (req, res, next) => {
  try {
    const result = await AssessmentService.create(req.body, req.user!.userId);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const assessment = await AssessmentService.getById(req.params.id, false);
    sendSuccess(res, assessment);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/attempts', authenticate, async (req, res, next) => {
  try {
    const attempts = await AssessmentService.getUserAttempts(req.params.id, req.user!.userId);
    sendSuccess(res, attempts);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/attempts', authenticate, validate(assessmentAttemptSchema), async (req, res, next) => {
  try {
    const result = await AssessmentService.submitAttempt(req.params.id, req.user!.userId, req.body.answers);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;
