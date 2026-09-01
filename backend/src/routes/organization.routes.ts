import { Router } from 'express';
import { OrganizationService } from '../services/organization.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { organizationSchema, inviteMemberSchema, paginationSchema } from '@skill-map/contracts';

const router = Router();

router.use(authenticate);

router.post('/', validate(organizationSchema), async (req, res, next) => {
  try {
    const result = await OrganizationService.create(req.body, req.user!.userId);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string | undefined;
    const result = await OrganizationService.list(page, limit, type);
    sendSuccess(res, result.items, 200, { page, limit, total: result.total, totalPages: result.totalPages });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const org = await OrganizationService.getById(req.params.id);
    sendSuccess(res, org);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const org = await OrganizationService.update(req.params.id, req.body);
    sendSuccess(res, org);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/members', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const members = await OrganizationService.getMembers(req.params.id, page, limit);
    sendSuccess(res, members.items, 200, { page, limit, total: members.total, totalPages: members.totalPages });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/invite', validate(inviteMemberSchema), async (req, res, next) => {
  try {
    const result = await OrganizationService.inviteMember(req.params.id, req.user!.userId, req.body);
    sendCreated(res, result);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/members/:userId', async (req, res, next) => {
  try {
    const result = await OrganizationService.updateMemberRole(req.params.id, req.params.userId, req.body.role);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const result = await OrganizationService.removeMember(req.params.id, req.params.userId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;
