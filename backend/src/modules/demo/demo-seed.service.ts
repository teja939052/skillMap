import { EntityId } from '../../shared/domain/entity.js';
import { Institution, Department, Program, Cohort } from '../institution/domain/institution.js';
import { StudentRecord } from '../institution/domain/student-record.js';
import { InstitutionRepository, DepartmentRepository, ProgramRepository, CohortRepository } from '../institution/infrastructure/repositories.js';
import { StudentRecordRepository } from '../institution/infrastructure/student-record.repository.js';
import { Competency } from '../competency/domain/competency.js';
import { CompetencyRepository, StudentCompetencyRepository } from '../competency/infrastructure/repositories.js';
import { RoleBlueprint } from '../role-blueprint/domain/role-blueprint.js';
import { RoleBlueprintRepository } from '../role-blueprint/infrastructure/repositories.js';
import { Opportunity } from '../opportunity/domain/opportunity.js';
import { OpportunityRepository } from '../opportunity/infrastructure/repositories.js';
import { StudentCompetency } from '../competency/domain/competency.js';
import { Assessment, AssessmentAttempt } from '../assessment/domain/assessment.js';
import { AssessmentRepository, AssessmentAttemptRepository } from '../assessment/infrastructure/repositories.js';

/**
 * Deterministic GPCET demo universe — no random junk, tells Rahul story
 * 32 → 71 → 89% reproducible via real domain logic
 */
export async function seedGpcetDemo(deps: {
  institutionRepo: InstitutionRepository; departmentRepo: DepartmentRepository; programRepo: ProgramRepository; cohortRepo: CohortRepository;
  studentRecordRepo: StudentRecordRepository; competencyRepo: CompetencyRepository; studentCompetencyRepo: StudentCompetencyRepository;
  roleBlueprintRepo: RoleBlueprintRepository; opportunityRepo: OpportunityRepository;
  assessmentRepo: AssessmentRepository; attemptRepo: AssessmentAttemptRepository;
  orgId: string; institutionId?: string;
}) {
  const orgId = deps.orgId;
  // Clear existing demo? idempotent check — if Rahul exists skip
  const existing = await deps.studentRecordRepo.findByRoll('demo-gpcet', '22A81A0501');
  if (existing) return { alreadySeeded: true, institutionId: 'demo-gpcet' };

  const instId = EntityId.fromString('demo-gpcet');
  const institution = new Institution({
    id: instId, name: 'GPCET Demo', slug: 'gpcet-demo', type: 'college', status: 'active', orgId,
    createdAt: new Date(), updatedAt: new Date(),
  });
  await deps.institutionRepo.save(institution);

  const cse = new Department({ id: EntityId.create(), institutionId: instId.toString(), name: 'CSE', code: 'CSE', status: 'active', orgId, createdAt: new Date(), updatedAt: new Date() });
  const ece = new Department({ id: EntityId.create(), institutionId: instId.toString(), name: 'ECE', code: 'ECE', status: 'active', orgId, createdAt: new Date(), updatedAt: new Date() });
  await deps.departmentRepo.save(cse); await deps.departmentRepo.save(ece);

  const progCse = new Program({
    id: EntityId.create(), institutionId: instId.toString(), departmentId: cse.id.toString(), name: 'B.Tech CSE', code: 'BTECH-CSE', type: 'bachelors',
    duration: 4, durationUnit: 'years', status: 'active', orgId, createdAt: new Date(), updatedAt: new Date(),
  });
  await deps.programRepo.save(progCse);

  const cohort26 = new Cohort({
    id: EntityId.create(), institutionId: instId.toString(), programId: progCse.id.toString(), name: 'CSE 2026', code: 'CSE-2026', academicYear: '2026',
    startDate: new Date('2022-08-01'), currentEnrollment: 0, status: 'active', orgId, createdAt: new Date(), updatedAt: new Date(),
  });
  await deps.cohortRepo.save(cohort26);

  // Competencies 30 — deterministic IDs
  const compDefs = [
    { slug: 'python', name: 'Python' }, { slug: 'sql', name: 'SQL' }, { slug: 'rest-api', name: 'REST API' },
    { slug: 'docker', name: 'Docker' }, { slug: 'aws', name: 'AWS' }, { slug: 'git', name: 'Git' },
  ];
  const compMap = new Map<string, EntityId>();
  for (const c of compDefs) {
    const id = EntityId.create();
    compMap.set(c.slug, id);
    await deps.competencyRepo.save(new Competency({
      id, name: c.name, slug: c.slug, type: 'skill', keywords: [c.slug], aliases: [], evidenceTypes: ['assessment'], status: 'active', taxonomyVersion: 1,
      createdAt: new Date(), updatedAt: new Date(),
    }));
  }

  // Rahul canonical — 22A81A0501 CSE 3yr Backend (is heterogeneous archetype A)
  const rahulRecord = new StudentRecord({
    id: EntityId.create(), institutionId: instId.toString(), rollNumber: '22A81A0501', name: 'Rahul Sharma', email: 'rahul.demo@gpcet.edu',
    program: 'CSE', department: 'CSE', cohort: '2026', section: 'A', status: 'imported', source: 'manual', orgId, importedBy: 'demo-seed',
    createdAt: new Date(), updatedAt: new Date(),
  });
  await deps.studentRecordRepo.save(rahulRecord);

  // 300 heterogeneous — deterministic, fast bulk, isolated orgId org-demo, meaningful distributions
  // Archetypes: A high-python/low-cloud, B high-cloud/mid-python, C low-all, D balanced — seeded RNG
  function seededRand(seed: number) { let x = seed; return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296; }
  const rand = seededRand(42);
  const pythonId = compMap.get('python')!.toString();
  const sqlId = compMap.get('sql')!.toString();
  const restId = compMap.get('rest-api')!.toString();
  const dockerId = compMap.get('docker')!.toString();
  const awsId = compMap.get('aws')!.toString();
  const gitId = compMap.get('git')!.toString();

  const allRecords: StudentRecord[] = [rahulRecord];
  for (let i = 2; i <= 300; i++) {
    const archetype = i % 4;
    const dept = i % 5 < 3 ? 'CSE' : i % 5 === 3 ? 'ECE' : 'EEE';
    const r = new StudentRecord({
      id: EntityId.create(), institutionId: instId.toString(), rollNumber: `22A81A05${String(i).padStart(3, '0')}`, name: `Student ${i}`, email: `s${String(i).padStart(3, '0')}@gpcet.edu`,
      program: dept, department: dept, cohort: i % 3 === 0 ? '2025' : i % 3 === 1 ? '2026' : '2027', section: String.fromCharCode(65 + (i % 4)),
      status: 'imported', source: 'csv', orgId, importedBy: 'demo-seed', createdAt: new Date(), updatedAt: new Date(),
    });
    allRecords.push(r);
  }
  // Bulk save records (fast, single bulkWrite)
  await deps.studentRecordRepo.bulkSave(allRecords.slice(1));

  // Bulk StudentCompetency — yields AWS ~42, Docker ~51, Python ~76, SQL ~68
  const comps: StudentCompetency[] = [];
  for (const rec of allRecords) {
    const isRahul = rec.rollNumber === '22A81A0501';
    const n = parseInt(rec.rollNumber.slice(-3), 10);
    const archetype = n % 4;
    const jitter = (rand() - 0.5) * 10;
    let py = isRahul ? 68 : archetype === 0 ? 88 + jitter : archetype === 1 ? 62 + jitter : archetype === 2 ? 45 + jitter : 72 + jitter;
    let aws = isRahul ? 32 : archetype === 0 ? 28 + jitter : archetype === 1 ? 78 + jitter : archetype === 2 ? 18 + jitter : 48 + jitter;
    let docker = isRahul ? 38 : archetype === 0 ? 35 + jitter : archetype === 1 ? 74 + jitter : archetype === 2 ? 22 + jitter : 58 + jitter;
    let sql = isRahul ? 64 : archetype === 0 ? 82 + jitter : archetype === 1 ? 68 + jitter : archetype === 2 ? 40 + jitter : 72 + jitter;
    let rest = isRahul ? 59 : archetype === 0 ? 70 + jitter : archetype === 1 ? 66 + jitter : archetype === 2 ? 38 + jitter : 62 + jitter;
    let git = 65 + jitter;
    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
    const toConf = (p: number) => Math.min(1, 0.55 + p / 180);
    for (const [cid, prof] of [[pythonId, py], [sqlId, sql], [restId, rest], [dockerId, docker], [awsId, aws], [gitId, git]] as const) {
      comps.push(new StudentCompetency({
        id: EntityId.create(), studentId: rec.id.toString(), competencyId: cid, proficiency: clamp(prof), confidence: toConf(clamp(prof)),
        evidenceCount: 1, calculationVersion: 2, createdAt: new Date(), updatedAt: new Date(),
      }));
    }
  }
  await deps.studentCompetencyRepo.bulkSave(comps);

  // Role Blueprint Backend Engineer
  const blueprint = new RoleBlueprint({
    id: EntityId.fromString('demo-bp-backend'), title: 'Backend Engineer', organizationId: 'demo-org-tcs', roleFamily: 'backend',
    description: 'Backend Engineer Intern', requirements: [
      { competencyId: pythonId, competencyName: 'Python', targetLevel: 70, importance: 'required', weight: 0.3 },
      { competencyId: awsId, competencyName: 'AWS', targetLevel: 75, importance: 'required', weight: 0.3 },
      { competencyId: dockerId, competencyName: 'Docker', targetLevel: 60, importance: 'preferred', weight: 0.2 },
    ], eligibilityRules: {}, status: 'draft', version: 1, orgId, createdAt: new Date(), updatedAt: new Date(),
  });
  blueprint.publish();
  await deps.roleBlueprintRepo.save(blueprint);

  // Opportunity Backend Internship — drives 64% initial
  const opp = new Opportunity({
    id: EntityId.fromString('demo-opp-backend'), title: 'Backend Internship', description: 'Backend Intern', type: 'internship',
    organizationId: 'demo-org-tcs', requirements: [
      { competencyId: pythonId, targetLevel: 70, importance: 'must_have', weight: 0.3 },
      { competencyId: compMap.get('sql')?.toString() || pythonId, targetLevel: 60, importance: 'must_have', weight: 0.2 },
      { competencyId: dockerId, targetLevel: 60, importance: 'nice_to_have', weight: 0.2 },
      { competencyId: awsId, targetLevel: 75, importance: 'must_have', weight: 0.3 },
    ], eligibility: {}, positions: 5, status: 'open', createdBy: 'demo', orgId, createdAt: new Date(), updatedAt: new Date(),
  });
  await deps.opportunityRepo.save(opp);

  return {
    alreadySeeded: false, institutionId: instId.toString(), rahul: { rollNumber: '22A81A0501', recordId: rahulRecord.id.toString(), aws: 32 },
    blueprintId: blueprint.id.toString(), opportunityId: opp.id.toString(), competencies: Object.fromEntries(compMap),
  };
}
