import { Router } from 'express';
import { asyncHandler, authenticate } from '../../../shared/http/middleware.js';
import { sendSuccess } from '../../../shared/http/response.js';

export function createSkillTwinRouter(service: any): Router {
  const router = Router();

  router.get('/me', authenticate, asyncHandler(async (req, res) => {
    const twin = await service.getTwin(req.user!.userId);
    sendSuccess(res, twin);
  }));

  router.get('/me/portfolio', authenticate, asyncHandler(async (req, res) => {
    const portfolio = await service.buildPortfolio(req.user!.userId);
    sendSuccess(res, portfolio);
  }));

  router.get('/me/role', authenticate, asyncHandler(async (req, res) => {
    const roleId = req.query.roleId as string | undefined;
    const view = await service.getRoleView(req.user!.userId, roleId);
    sendSuccess(res, view);
  }));

  return router;
}
