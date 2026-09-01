import { createApp } from './app.js';
import { connectDatabase } from './shared/persistence/database.js';
import { env } from './config/env.js';
import { AuthService } from './modules/identity/application/auth-service.js';
import { UserRepository, RefreshSessionRepository } from './modules/identity/infrastructure/repositories.js';
import { CompetencyRepository, StudentCompetencyRepository } from './modules/competency/infrastructure/repositories.js';
import { EvidenceRepository } from './modules/evidence/infrastructure/repositories.js';
import { OpportunityRepository, ApplicationRepository } from './modules/opportunity/infrastructure/repositories.js';
import { CompetencyScoringEngine } from './modules/competency/domain/scoring-engine.js';
import { MatchingEngine, analyzeGaps } from './modules/matching/domain/matching-engine.js';
import { RoleBlueprintRepository } from './modules/role-blueprint/infrastructure/repositories.js';
import { RoleBlueprintService } from './modules/role-blueprint/application/role-blueprint-service.js';
import { InstitutionReadinessRepository, SkillGapSummaryRepository, InterventionOutcomeRepository, IndustryDemandRepository, PlacementFunnelRepository } from './modules/analytics/infrastructure/repositories.js';
import { AnalyticsService } from './modules/analytics/application/analytics-service.js';
import { InterventionRepository, EnrollmentRepository, OutcomeRepository } from './modules/intervention/infrastructure/repositories.js';
import { InterventionService } from './modules/intervention/application/intervention-service.js';
import { EntityId } from './shared/domain/entity.js';
import { AssessmentRepository, AssessmentAttemptRepository, QuestionBankRepository } from './modules/assessment/infrastructure/repositories.js';
import { AssessmentService } from './modules/assessment/application/assessment-service.js';
import { EvidenceService } from './modules/evidence/application/evidence-service.js';
import { StudentCompetencyService } from './modules/competency/application/competency-service.js';
import { InstitutionService } from './modules/institution/application/institution-service.js';
import { InstitutionRepository, DepartmentRepository, ProgramRepository, CurriculumRepository, CurriculumMappingRepository, CohortRepository } from './modules/institution/infrastructure/repositories.js';
import { StudentRecordRepository } from './modules/institution/infrastructure/student-record.repository.js';
import { StudentImportService } from './modules/institution/application/student-import.service.js';
import { OpportunityService } from './services/opportunity.service.js';

async function main() {
  await connectDatabase();

  const userRepo = new UserRepository();
  const sessionRepo = new RefreshSessionRepository();
  const competencyRepo = new CompetencyRepository();
  const studentCompetencyRepo = new StudentCompetencyRepository();
  const evidenceRepo = new EvidenceRepository();
  const opportunityRepo = new OpportunityRepository();
  const applicationRepo = new ApplicationRepository();
  const roleBlueprintRepo = new RoleBlueprintRepository();
  const readinessRepo = new InstitutionReadinessRepository();
  const gapRepo = new SkillGapSummaryRepository();
  const outcomeRepo = new InterventionOutcomeRepository();
  const demandRepo = new IndustryDemandRepository();
  const funnelRepo = new PlacementFunnelRepository();
  const interventionRepo = new InterventionRepository();
  const enrollmentRepo = new EnrollmentRepository();
  const outcomePersistRepo = new OutcomeRepository();
  const assessmentRepo = new AssessmentRepository();
  const attemptRepo = new AssessmentAttemptRepository();
  const questionBankRepo = new QuestionBankRepository();
  const institutionRepo = new InstitutionRepository();
  const departmentRepo = new DepartmentRepository();
  const programRepo = new ProgramRepository();
  const curriculumRepo = new CurriculumRepository();
  const curriculumMappingRepo = new CurriculumMappingRepository();
  const cohortRepo = new CohortRepository();
  const studentRecordRepo = new StudentRecordRepository();
  const studentImportService = new StudentImportService(studentRecordRepo);

  const authService = new AuthService(userRepo, sessionRepo);
  const evidenceService = new EvidenceService(evidenceRepo);
  const competencyService = new StudentCompetencyService(studentCompetencyRepo, evidenceService);
  const assessmentService = new AssessmentService(assessmentRepo, attemptRepo, questionBankRepo, evidenceService, competencyService);
  const scoringEngine = new CompetencyScoringEngine();
  const matchingEngine = new MatchingEngine();
  const roleBlueprintService = new RoleBlueprintService(roleBlueprintRepo);
  const interventionCore = new InterventionService(interventionRepo, enrollmentRepo, outcomePersistRepo);
  const institutionService = new InstitutionService(
    institutionRepo, departmentRepo, programRepo,
    curriculumRepo, curriculumMappingRepo, cohortRepo
  );
  const analyticsService = new AnalyticsService(readinessRepo, gapRepo, outcomeRepo, demandRepo, funnelRepo, matchingEngine, scoringEngine);

  const opportunityService = {
    list: (page: number, limit: number, filters: any = {}) => OpportunityService.list(page, limit, filters),
    getById: (id: string) => OpportunityService.getById(id),
    create: (data: any, userId: string) => OpportunityService.create({ ...data, createdBy: userId }),
    update: (id: string, updates: any) => OpportunityService.update(id, updates),
    apply: (opportunityId: string, applicantId: string, data: any) => OpportunityService.apply(opportunityId, applicantId, data),
    listApplications: (opportunityId: string, page: number, limit: number) => OpportunityService.listApplications(opportunityId, page, limit),
  };

  const matchingService = {
    matchOpportunities: async (userId: string, _query: any = {}) => {
      const studentComps = await studentCompetencyRepo.findByStudent(userId);
      const sc = studentComps.map((c) => ({ competencyId: c.competencyId, proficiency: c.proficiency, confidence: c.confidence }));
      const opportunities = await opportunityRepo.findOpportunities({ status: 'open' } as any);
      const items = opportunities.map((opp) => {
        const result = matchingEngine.calculateMatch({ studentId: userId, studentCompetencies: sc, requirements: opp.requirements as any, eligibility: { passed: true } });
        return { opportunityId: opp.id.toString(), title: opp.title, type: opp.type, score: result.score, strengths: result.strengths, gaps: result.gaps, explanation: result.explanation };
      }).sort((a, b) => b.score - a.score);
      return { items, total: items.length };
    },
    matchCandidates: async (opportunityId: string, _query: any = {}) => {
      const opp = await opportunityRepo.findOpportunityById(opportunityId);
      if (!opp) return { items: [], total: 0, error: 'Opportunity not found' };
      const allDocs = await (studentCompetencyRepo as any).collection.find({}).limit(5000).toArray();
      const byStudent = new Map<string, Array<{ competencyId: string; proficiency: number; confidence: number }>>();
      for (const d of allDocs) {
        const arr = byStudent.get(d.studentId) || [];
        arr.push({ competencyId: d.competencyId, proficiency: d.proficiency, confidence: d.confidence });
        byStudent.set(d.studentId, arr);
      }
      const items = Array.from(byStudent.entries()).map(([studentId, comps]) => {
        const result = matchingEngine.calculateMatch({ studentId, studentCompetencies: comps, requirements: opp.requirements as any, eligibility: { passed: true } });
        return { studentId, score: result.score, strengths: result.strengths, gaps: result.gaps, competencyScores: result.competencyScores };
      }).sort((a, b) => b.score - a.score).slice(0, 50);
      const distribution = { ready: items.filter((i) => i.score >= 75).length, nearReady: items.filter((i) => i.score >= 50 && i.score < 75).length, notReady: items.filter((i) => i.score < 50).length };
      return { opportunityId, items, total: items.length, distribution, requirements: opp.requirements };
    },
    analyzeGaps: async (userId: string, targetRoleId?: string) => {
      const studentComps = await studentCompetencyRepo.findByStudent(userId);
      const sc = studentComps.map((c) => ({ competencyId: c.competencyId, proficiency: c.proficiency, confidence: c.confidence }));
      let requirements: any[] = [];
      if (targetRoleId) {
        const bp = await roleBlueprintRepo.findEntityById(targetRoleId);
        if (bp) requirements = bp.requirements.map((r) => ({ competencyId: r.competencyId, competencyName: r.competencyName, targetLevel: r.targetLevel, importance: r.importance === 'required' ? 'must_have' as const : r.importance === 'preferred' ? 'nice_to_have' as const : 'bonus' as const, weight: r.weight }));
      } else {
        const demand = await demandRepo.findTopDemand(10);
        requirements = demand.map((d) => ({ competencyId: d.competencyId, competencyName: d.competencyName, targetLevel: d.averageRequiredLevel || 70, importance: 'must_have' as const, weight: 0.15 }));
      }
      const gaps = analyzeGaps(sc, requirements);
      return { gaps, totalGaps: gaps.length, criticalGaps: gaps.filter((g) => g.importance === 'must_have' && g.gap > 20).length };
    },
  };

  const facultyService = {
    getProfile: async () => null,
    createProfile: async (data: any) => ({ id: EntityId.create().toString(), ...data }),
    updateProfile: async () => null,
    searchByExpertise: async () => ({ items: [] }),
    listResearch: async () => ({ items: [] }),
    createResearch: async (data: any) => ({ id: EntityId.create().toString(), ...data }),
    listMentorships: async () => ({ items: [] }),
    createMentorship: async (data: any) => ({ id: EntityId.create().toString(), ...data }),
  };

  const analyticsServiceProxy = {
    getStudentDashboard: (userId: string, _query?: any) => studentCompetencyRepo.findByStudent(userId).then((comps) => analyticsService.getStudentDashboard(userId, comps as any)),
    getInstitutionDashboard: (q: any) => analyticsService.getInstitutionDashboard(q),
    getIndustryDashboard: (q: any) => analyticsService.getIndustryDashboard(q),
    getSkillGaps: (institutionId: string, requirements?: any) => analyticsService.getSkillGaps(institutionId, requirements),
    getInterventionOutcomes: (id: string) => analyticsService.getInterventionOutcomes(id),
    getDemandSignals: (region?: string) => analyticsService.getDemandSignals(region),
  };

  const roleBlueprintServiceProxy = {
    list: (q: any) => roleBlueprintService.listBlueprints(q),
    getById: (id: string) => roleBlueprintService.getById(id),
    create: (data: any, userId: string) => roleBlueprintService.createBlueprint(data, userId),
    publish: (id: string, userId: string) => roleBlueprintService.publishBlueprint(id, userId),
    addRequirement: (id: string, req: any, userId: string) => roleBlueprintService.addRequirement(id, req, userId),
    getMatchAnalysis: (id: string, comps: any) => roleBlueprintService.getMatchAnalysis(id, comps),
  };

  const interventionService = {
    listInterventions: (q: any) => interventionCore.listInterventions(q),
    getById: (id: string) => interventionCore.getById(id),
    createIntervention: (data: any, userId: string) => interventionCore.createIntervention(data, userId),
    publishIntervention: (id: string) => interventionCore.publishIntervention(id),
    completeIntervention: (id: string) => interventionCore.completeIntervention(id),
    cancelIntervention: (id: string) => interventionCore.cancelIntervention(id),
    getEnrollments: (id: string) => interventionCore.getEnrollments(id),
    getOutcomes: (id: string) => interventionCore.getOutcomes(id),
    enrollStudent: async (interventionId: string, studentId: string) => {
      const result = await interventionCore.enrollStudent(interventionId, studentId);
      if (!result.success) return result;
      try {
        const intervention = await interventionRepo.findInterventionById(interventionId);
        if (intervention) {
          const baseline: Record<string, { level: number; confidence: number; evidenceCount: number }> = {};
          for (const cid of intervention.competencyIds) {
            const sc = await studentCompetencyRepo.findByStudentAndCompetency(studentId, cid);
            baseline[cid] = { level: sc?.proficiency ?? 0, confidence: sc?.confidence ?? 0, evidenceCount: sc?.evidenceCount ?? 0 };
          }
          const enrollment = result.value as any;
          const existingNotes = enrollment.notes ? JSON.parse(enrollment.notes) : {};
          enrollment.updateNotes(JSON.stringify({ ...existingNotes, baseline, baselineCapturedAt: new Date().toISOString(), interventionId, targetCompetencies: intervention.competencyIds }));
          await enrollmentRepo.save(enrollment);
        }
      } catch (e) { console.warn('[P7] baseline capture failed', e); }
      return result;
    },
    updateEnrollmentStatus: (enrollmentId: string, data: any) => interventionCore.updateEnrollmentStatus(enrollmentId, data),
    recordOutcome: async (data: any) => {
      const enrollment = await enrollmentRepo.findByInterventionAndStudent(data.interventionId, data.studentId);
      if (!enrollment) return { success: false, error: { message: 'Enrollment not found — student must enroll before completion' } } as any;
      if (!['enrolled', 'in_progress'].includes(enrollment.status)) {
        return { success: false, error: { message: `Cannot record outcome in status ${enrollment.status}` } } as any;
      }
      // HARDENED CONTRACT: require postAssessmentAttemptId, reject free-form afterLevel (integrity fix)
      if (data.afterLevel !== undefined && !data.postAssessmentAttemptId) {
        return { success: false, error: { message: 'afterLevel not allowed — provide postAssessmentAttemptId for server-calculated score' } } as any;
      }
      if (!data.postAssessmentAttemptId) {
        return { success: false, error: { message: 'postAssessmentAttemptId required — outcome must be derived from verified assessment' } } as any;
      }
      // Idempotency: same postAssessmentAttemptId must not create duplicate Outcome/Evidence
      const dupCheck = await outcomePersistRepo.findByInterventionAndStudent(data.interventionId, data.studentId);
      if (dupCheck.some((o: any) => o.postAssessmentAttemptId === data.postAssessmentAttemptId)) {
        return { success: false, error: { message: 'Outcome already recorded for this post-assessment — idempotent' } } as any;
      }
      const attempt = await attemptRepo.findEntityById(data.postAssessmentAttemptId);
      if (!attempt) return { success: false, error: { message: 'Post-assessment attempt not found' } } as any;
      if (attempt.userId !== data.studentId) return { success: false, error: { message: 'Attempt does not belong to student' } } as any;
      if (attempt.status !== 'completed') return { success: false, error: { message: 'Post-assessment must be completed before recording outcome' } } as any;

      // Derive afterLevel/afterConfidence from attempt's competencyScores (server-calculated via AssessmentAttempt.calculateScore)
      const compScore = attempt.competencyScores.find((cs: any) => cs.competencyId === data.competencyId) || attempt.competencyScores[0];
      if (!compScore) return { success: false, error: { message: `Attempt has no score for competency ${data.competencyId}` } } as any;
      const afterLevel = compScore.score; // 0-100 server-calculated
      const afterConfidence = Math.min(1, 0.6 + (compScore.score / 250)); // deterministic: higher score → higher confidence, capped 1

      let beforeLevel = data.beforeLevel;
      let beforeConfidence = data.beforeConfidence ?? 0;
      let baseline: Record<string, any> = {};
      try { baseline = JSON.parse(enrollment.notes || '{}').baseline || {}; } catch {}
      const b = baseline[data.competencyId];
      if (beforeLevel === undefined) beforeLevel = b?.level ?? 0;
      if (data.beforeConfidence === undefined) beforeConfidence = b?.confidence ?? 0;

      // Compute match delta — previous vs current (only affected competencies, not whole analytics rebuild)
      let matchImpact: any = undefined;
      try {
        const prevComps = await studentCompetencyRepo.findByStudent(data.studentId);
        const prevMap = prevComps.map((c: any) => ({ competencyId: c.competencyId, proficiency: c.proficiency, confidence: c.confidence }));
        // Find a representative opportunity for this competency (first open requiring it) for demo delta
        const opps = await opportunityRepo.findOpportunities({ status: 'open' } as any);
        const relevant = opps.find((o: any) => o.requirements.some((r: any) => r.competencyId === data.competencyId));
        if (relevant) {
          const beforeReq = { studentId: data.studentId, studentCompetencies: prevMap, requirements: relevant.requirements as any, eligibility: { passed: true } };
          const beforeScore = matchingEngine.calculateMatch(beforeReq).score;
          // Simulate after by patching prevMap with afterLevel for target competency
          const afterMap = prevMap.map((m: any) => m.competencyId === data.competencyId ? { ...m, proficiency: afterLevel, confidence: afterConfidence } : m);
          if (!prevMap.find((m: any) => m.competencyId === data.competencyId)) afterMap.push({ competencyId: data.competencyId, proficiency: afterLevel, confidence: afterConfidence });
          const afterScore = matchingEngine.calculateMatch({ ...beforeReq, studentCompetencies: afterMap }).score;
          matchImpact = { opportunityId: relevant.id.toString(), previousScore: beforeScore, currentScore: afterScore, algorithmVersion: 'v2.0' };
        }
      } catch {}

      // Persist structured Outcome (not notes hack)
      const outcomeRes = await interventionCore.recordOutcome({ interventionId: data.interventionId, studentId: data.studentId, competencyId: data.competencyId, beforeLevel, afterLevel, beforeConfidence, afterConfidence, notes: data.notes, orgId: data.orgId || enrollment.orgId });
      // Patch structured fields onto persisted document (domain now supports them)
      if (outcomeRes.success) {
        try {
          const oc: any = outcomeRes.value;
          oc.postAssessmentAttemptId = data.postAssessmentAttemptId;
          oc.enrollmentId = enrollment.id.toString();
          oc.competencyResults = [{ competencyId: data.competencyId, beforeLevel, afterLevel, improvement: afterLevel - beforeLevel }];
          oc.matchImpact = matchImpact;
          await outcomePersistRepo.save(oc);
        } catch {}
      }
      if (!outcomeRes.success) return outcomeRes;

      // Create verified evidence linked to attempt — drives passport
      const { Evidence } = await import('./modules/evidence/domain/evidence.js');
      const evidence = new Evidence({
        id: EntityId.create(), ownerId: data.studentId, competencyId: data.competencyId, type: 'assessment' as any,
        title: `Post-assessment — ${data.competencyId}`, description: data.notes || `Post-assessment ${attempt.id.toString()} after intervention`,
        proficiencyLevel: afterLevel, confidence: afterConfidence, verificationStatus: 'pending' as any,
        metadata: { interventionId: data.interventionId, outcomeId: (outcomeRes.value as any).id.toString(), postAssessmentAttemptId: data.postAssessmentAttemptId, beforeLevel, afterLevel, attemptScore: compScore.score },
        provenance: { source: 'intervention', sourceId: data.interventionId, importedAt: new Date() },
        orgId: data.orgId || enrollment.orgId, createdAt: new Date(), updatedAt: new Date(),
      });
      await evidenceRepo.save(evidence);
      const v = evidence.verify('system', 'Post-assessment verified');
      if (v.success) await evidenceRepo.save(evidence);

      // Recalculate ONLY affected competency — deterministic
      const allEvidence = await evidenceRepo.findByOwner(data.studentId);
      const compEvidence = allEvidence.filter((e: any) => e.competencyId === data.competencyId);
      const existing = await studentCompetencyRepo.findByStudentAndCompetency(data.studentId, data.competencyId);
      const recalc = scoringEngine.recalculateStudentCompetency(existing as any, compEvidence as any);
      if (recalc.success) await studentCompetencyRepo.save(recalc.value as any);

      try { const c = enrollment.complete(); if (c.success) await enrollmentRepo.save(enrollment); } catch {}

      // Return enriched outcome for UI to show delta immediately
      return { success: true, value: { ...(outcomeRes as any).value, matchImpact, competencyResults: [{ competencyId: data.competencyId, beforeLevel, afterLevel, improvement: afterLevel - beforeLevel }] } } as any;
    },
    list: (q: any) => interventionCore.listInterventions(q),
    create: (d: any, u: string) => interventionCore.createIntervention(d, u),
    publish: (id: string) => interventionCore.publishIntervention(id),
    complete: (id: string) => interventionCore.completeIntervention(id),
    cancel: (id: string) => interventionCore.cancelIntervention(id),
    enroll: async (id: string, s: string) => {
      const r: any = await interventionCore.enrollStudent(id, s);
      return r;
    },
  };

  try { await studentRecordRepo.ensureIndexes(); } catch {}

  const app = createApp({
    authService,
    competencyService,
    opportunityService,
    matchingService,
    evidenceService,
    institutionService,
    interventionService,
    analyticsService: analyticsServiceProxy,
    facultyService,
    roleBlueprintService: roleBlueprintServiceProxy,
    assessmentService,
    studentImportService,
    studentRecordRepo,
  } as any);

  app.listen(env.port, () => {
    console.log(`[Skill Map API] Running on port ${env.port}`);
    console.log(`[Skill Map API] Environment: ${env.nodeEnv}`);
    console.log(`[API] http://localhost:${env.port}/api/v1/health`);
  });
}

main().catch((err) => {
  console.error('[Skill Map API] Failed to start:', err);
  process.exit(1);
});
