import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { authenticate } from '../middleware/auth.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', async (req, res, next) => {
  try {
    const dashboard = await AnalyticsService.getDashboard(req.user!.userId, req.user!.role);
    sendSuccess(res, dashboard);
  } catch (err) {
    next(err);
  }
});

router.get('/heatmap', async (req, res, next) => {
  try {
    const orgId = req.query.orgId as string || req.user!.userId;
    const heatmap = await AnalyticsService.getHeatmap(orgId);
    sendSuccess(res, heatmap);
  } catch (err) {
    next(err);
  }
});

router.get('/demand', async (_req, res, next) => {
  try {
    const demand = [
      { competency: 'Python', demand: 92, growth: 12 },
      { competency: 'React', demand: 88, growth: 18 },
      { competency: 'SQL', demand: 85, growth: 5 },
      { competency: 'Docker', demand: 78, growth: 25 },
      { competency: 'AWS', demand: 75, growth: 22 },
      { competency: 'Machine Learning', demand: 72, growth: 30 },
    ];
    sendSuccess(res, demand);
  } catch (err) {
    next(err);
  }
});

router.get('/outcomes', async (req, res, next) => {
  try {
    const InterventionService = await import('../services/intervention.service.js');
    const outcomes = await InterventionService.InterventionService.getOutcomes(req.query.orgId as string);
    sendSuccess(res, outcomes);
  } catch (err) {
    next(err);
  }
});

export default router;
