import { Router } from 'express';
import { OpportunityService } from '../services/opportunity.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { opportunitySchema, applicationSchema, updateApplicationSchema, paginationSchema } from '@skill-map/contracts';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string | undefined;
    const orgId = req.query.orgId as string | undefined;
    const result = await OpportunityService.list(page, limit, { type, orgId });
    sendSuccess(res, result.items, 200, { page, limit, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(opportunitySchema), async (req, res, next) => {
  try {
    const result = await OpportunityService.create({ ...req.body, createdBy: req.user!.userId });
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const opportunity = await OpportunityService.getById(req.params.id);
    sendSuccess(res, opportunity);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await OpportunityService.update(req.params.id, req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/apply', authenticate, validate(applicationSchema), async (req, res, next) => {
  try {
    const result = await OpportunityService.apply(req.params.id, req.user!.userId, req.body);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/applications', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await OpportunityService.listApplications(req.params.id, page, limit);
    sendSuccess(res, result.items, 200, { page, limit, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/applications/:appId', authenticate, validate(updateApplicationSchema), async (req, res, next) => {
  try {
    const result = await OpportunityService.updateApplication(req.params.appId, req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;
