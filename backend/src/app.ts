import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { handleError } from './shared/http/middleware.js';
import { createAuthRouter } from './modules/identity/http/auth-controller.js';
import { createCompetencyRouter } from './modules/competency/http/competency-controller.js';
import { createOpportunityRouter } from './modules/opportunity/http/opportunity-controller.js';
import { createMatchingRouter } from './modules/matching/http/matching-controller.js';
import { createEvidenceRouter } from './modules/evidence/http/evidence-controller.js';
import { createInstitutionRouter } from './modules/institution/http/institution-controller.js';
import { createInterventionRouter } from './modules/intervention/http/intervention-controller.js';
import { createAnalyticsRouter } from './modules/analytics/http/analytics-controller.js';
import { createFacultyRouter } from './modules/faculty/http/faculty-controller.js';
import { createRoleBlueprintRouter } from './modules/role-blueprint/http/role-blueprint-controller.js';
import { createAssessmentRouter } from './modules/assessment/http/assessment-controller.js';
import { createDemoRouter } from './modules/demo/demo.router.js';
import { AuthService } from './modules/identity/application/auth-service.js';

export function createApp(deps: AppDependencies) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  app.use('/api/v1/health', (_req, res) => {
    res.json({ status: true, timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', createAuthRouter(deps.authService));
  app.use('/api/v1/competencies', createCompetencyRouter(deps.competencyService));
  app.use('/api/v1/opportunities', createOpportunityRouter(deps.opportunityService));
  app.use('/api/v1/matching', createMatchingRouter(deps.matchingService));
  app.use('/api/v1/evidence', createEvidenceRouter(deps.evidenceService));
  app.use('/api/v1/institutions', createInstitutionRouter(deps.institutionService, (deps as any).studentImportService, (deps as any).studentRecordRepo));
  app.use('/api/v1/interventions', createInterventionRouter(deps.interventionService));
  app.use('/api/v1/analytics', createAnalyticsRouter(deps.analyticsService));
  app.use('/api/v1/faculty', createFacultyRouter(deps.facultyService));
  app.use('/api/v1/role-blueprints', createRoleBlueprintRouter(deps.roleBlueprintService));
  app.use('/api/v1/assessments', createAssessmentRouter(deps.assessmentService));
  app.use('/api/v1/demo', createDemoRouter());

  app.use(handleError);

  return app;
}

export interface AppDependencies {
  authService: AuthService;
  competencyService: any;
  opportunityService: any;
  matchingService: any;
  evidenceService: any;
  institutionService: any;
  interventionService: any;
  analyticsService: any;
  facultyService: any;
  roleBlueprintService: any;
  assessmentService: any;
}
