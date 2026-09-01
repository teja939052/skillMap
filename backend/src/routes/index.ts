import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import organizationRoutes from './organization.routes.js';
import competencyRoutes from './competency.routes.js';
import roleRoutes from './role.routes.js';
import assessmentRoutes from './assessment.routes.js';
import evidenceRoutes from './evidence.routes.js';
import opportunityRoutes from './opportunity.routes.js';
import interventionRoutes from './intervention.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/competencies', competencyRoutes);
router.use('/roles', roleRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/interventions', interventionRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
