import { Router } from 'express';
import { InterventionService } from '../services/intervention.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { interventionSchema, enrollInterventionSchema, outcomeSchema, paginationSchema } from '@skill-map/contracts';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const orgId = req.query.orgId as string || req.user!.userId;
    const result = await InterventionService.list(orgId, page, limit);
    sendSuccess(res, result.items, 200, { page, limit, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(interventionSchema), async (req, res, next) => {
  try {
    const result = await InterventionService.create(req.body);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await InterventionService.list(req.user!.userId, page, limit);
    const item = result.items.find((i: any) => i.id === req.params.id);
    sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/enroll', validate(enrollInterventionSchema), async (req, res, next) => {
  try {
    const result = await InterventionService.enroll(req.params.id, req.user!.userId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/outcomes', validate(outcomeSchema), async (req, res, next) => {
  try {
    const result = await InterventionService.recordOutcome({ ...req.body, interventionId: req.params.id });
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/outcomes', async (req, res, next) => {
  try {
    const outcomes = await InterventionService.getOutcomes(req.query.orgId as string);
    sendSuccess(res, outcomes);
  } catch (err) {
    next(err);
  }
});

export default router;
