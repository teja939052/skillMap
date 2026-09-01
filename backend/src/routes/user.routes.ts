import { Router } from 'express';
import { UserService } from '../services/user.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess } from '../utils/response.js';
import { updateUserSchema, paginationSchema } from '@skill-map/contracts';

const router = Router();

router.use(authenticate);

router.get('/:id', async (req, res, next) => {
  try {
    const user = await UserService.getById(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validate(updateUserSchema), async (req, res, next) => {
  try {
    const user = await UserService.update(req.params.id, req.body);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/profile', async (req, res, next) => {
  try {
    const user = await UserService.getById(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/competencies', async (req, res, next) => {
  try {
    const passport = await UserService.getCompetencyPassport(req.params.id);
    sendSuccess(res, passport);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/evidence', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const evidence = await UserService.getCompetencyPassport(req.params.id);
    sendSuccess(res, evidence);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/gaps', async (req, res, next) => {
  try {
    const gaps = await UserService.getGaps(req.params.id, req.query.roleId as string);
    sendSuccess(res, gaps);
  } catch (err) {
    next(err);
  }
});

export default router;
