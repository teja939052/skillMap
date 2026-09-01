import { Router } from 'express';
import { EvidenceService } from '../services/evidence.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { evidenceSchema, verifyEvidenceSchema, paginationSchema } from '@skill-map/contracts';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await EvidenceService.listByUser(req.user!.userId, page, limit);
    sendSuccess(res, result.items, 200, { page, limit, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(evidenceSchema), async (req, res, next) => {
  try {
    const result = await EvidenceService.create({ ...req.body, ownerId: req.user!.userId });
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await EvidenceService.listByUser(req.user!.userId, page, limit);
    const item = result.items.find((i: any) => i.id === req.params.id);
    sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/verify', authenticate, validate(verifyEvidenceSchema), async (req, res, next) => {
  try {
    const result = await EvidenceService.verify(req.params.id, req.user!.userId, req.body.status, req.body.notes);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/stats/me', authenticate, async (req, res, next) => {
  try {
    const stats = await EvidenceService.getStats(req.user!.userId);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
});

export default router;
