import { Router } from 'express';
import { CompetencyService } from '../services/competency.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { competencySchema, roleBlueprintSchema, paginationSchema } from '@skill-map/contracts';

const router = Router();

router.get('/tree', async (_req, res, next) => {
  try {
    const tree = await CompetencyService.getTree();
    sendSuccess(res, tree);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const domain = req.query.domain as string | undefined;
    const type = req.query.type as string | undefined;
    const result = await CompetencyService.list(page, limit, domain, type);
    sendSuccess(res, result.items, 200, { page, limit, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(competencySchema), async (req, res, next) => {
  try {
    const result = await CompetencyService.create(req.body);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await CompetencyService.create(req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await CompetencyService.list(page, limit);
    sendSuccess(res, result.items);
  } catch (err) {
    next(err);
  }
});

export default router;
