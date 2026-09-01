import { Router } from 'express';
import { asyncHandler } from '../../shared/http/middleware.js';
import { InstitutionRepository, DepartmentRepository, ProgramRepository, CohortRepository } from '../institution/infrastructure/repositories.js';
import { StudentRecordRepository } from '../institution/infrastructure/student-record.repository.js';
import { CompetencyRepository, StudentCompetencyRepository } from '../competency/infrastructure/repositories.js';
import { RoleBlueprintRepository } from '../role-blueprint/infrastructure/repositories.js';
import { OpportunityRepository } from '../opportunity/infrastructure/repositories.js';
import { AssessmentRepository, AssessmentAttemptRepository } from '../assessment/infrastructure/repositories.js';
import { seedGpcetDemo } from './demo-seed.service.js';

export function createDemoRouter(): Router {
  const router = Router();

  router.post('/seed', asyncHandler(async (_req, res) => {
    const result = await seedGpcetDemo({
      institutionRepo: new InstitutionRepository(),
      departmentRepo: new DepartmentRepository(),
      programRepo: new ProgramRepository(),
      cohortRepo: new CohortRepository(),
      studentRecordRepo: new StudentRecordRepository(),
      competencyRepo: new CompetencyRepository(),
      studentCompetencyRepo: new StudentCompetencyRepository(),
      roleBlueprintRepo: new RoleBlueprintRepository(),
      opportunityRepo: new OpportunityRepository(),
      assessmentRepo: new AssessmentRepository(),
      attemptRepo: new AssessmentAttemptRepository(),
      orgId: 'org-demo',
    });
    res.json({ success: true, data: result });
  }));

  router.get('/status', asyncHandler(async (_req, res) => {
    const repo = new StudentRecordRepository();
    const rahul = await repo.findByRoll('demo-gpcet', '22A81A0501');
    const count = await (repo as any).collection.countDocuments({ institutionId: 'demo-gpcet' });
    res.json({ success: true, data: { seeded: !!rahul, count, rahul: rahul ? { rollNumber: rahul.rollNumber, status: rahul.status } : null } });
  }));

  router.post('/reset', asyncHandler(async (_req, res) => {
    const orgId = 'org-demo';
    const institutionId = 'demo-gpcet';
    // Isolated delete — only org-demo / demo-gpcet, never prod
    const { getCollection } = await import('../../shared/persistence/database.js');
    const cols = ['institutions', 'departments', 'programs', 'cohorts', 'student_records', 'student_competencies', 'competencies', 'role_blueprints', 'opportunities', 'assessment_attempts'] as const;
    for (const c of cols) {
      try { await getCollection(c).deleteMany({ $or: [{ orgId }, { institutionId }, { _id: institutionId as any }] } as any); } catch {}
    }
    // Clear competencies with slug seed set
    try { await getCollection('competencies').deleteMany({ slug: { $in: ['python', 'sql', 'rest-api', 'docker', 'aws', 'git'] } } as any); } catch {}
    const result = await seedGpcetDemo({
      institutionRepo: new InstitutionRepository(),
      departmentRepo: new DepartmentRepository(),
      programRepo: new ProgramRepository(),
      cohortRepo: new CohortRepository(),
      studentRecordRepo: new StudentRecordRepository(),
      competencyRepo: new CompetencyRepository(),
      studentCompetencyRepo: new StudentCompetencyRepository(),
      roleBlueprintRepo: new RoleBlueprintRepository(),
      opportunityRepo: new OpportunityRepository(),
      assessmentRepo: new AssessmentRepository(),
      attemptRepo: new AssessmentAttemptRepository(),
      orgId,
    });
    res.json({ success: true, data: { reset: true, ...result } });
  }));

  return router;
}
