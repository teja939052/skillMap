import { connectDatabase, disconnectDatabase } from '../shared/persistence/database.js';
import { env } from '../config/env.js';
import { EntityId } from '../shared/domain/entity.js';
import { User } from '../modules/identity/domain/user.js';
import { Evidence } from '../modules/evidence/domain/evidence.js';
import { CompetencyScoringEngine } from '../modules/competency/domain/scoring-engine.js';
import { StudentCompetency, StudentCompetencyProps } from '../modules/competency/domain/competency.js';
import { Assessment, AssessmentProps, Question } from '../modules/assessment/domain/assessment.js';
import { AssessmentAttempt, AssessmentAttemptProps } from '../modules/assessment/domain/assessment.js';
import { UserRepository } from '../modules/identity/infrastructure/repositories.js';
import { CompetencyRepository, StudentCompetencyRepository } from '../modules/competency/infrastructure/repositories.js';
import { EvidenceRepository } from '../modules/evidence/infrastructure/repositories.js';
import { AssessmentRepository, AssessmentAttemptRepository, QuestionBankRepository } from '../modules/assessment/infrastructure/repositories.js';
import { InstitutionRepository, DepartmentRepository, ProgramRepository, CohortRepository } from '../modules/institution/infrastructure/repositories.js';
import { hashPassword } from '../utils/password.js';
import { ok } from '../shared/domain/result.js';

async function main() {
  console.log('[Demo Seed] Connecting to database...');
  await connectDatabase();

  const userRepo = new UserRepository();
  const studentCompetencyRepo = new StudentCompetencyRepository();
  const evidenceRepo = new EvidenceRepository();
  const assessmentRepo = new AssessmentRepository();
  const attemptRepo = new AssessmentAttemptRepository();
  const questionBankRepo = new QuestionBankRepository();
  const institutionRepo = new InstitutionRepository();
  const departmentRepo = new DepartmentRepository();
  const programRepo = new ProgramRepository();
  const cohortRepo = new CohortRepository();

  const orgId = 'org-vit-pune';
  const vitId = EntityId.create();
  const cseDeptId = EntityId.create();
  const btechProgramId = EntityId.create();
  const cohort2025Id = EntityId.create();

  await institutionRepo.save({
    id: vitId, name: 'VIT Pune', type: 'university', orgId, location: 'Pune, Maharashtra',
    createdAt: new Date(), updatedAt: new Date(),
  } as any);
  await departmentRepo.save({
    id: cseDeptId, institutionId: vitId.toString(), name: 'Computer Science', orgId,
    createdAt: new Date(), updatedAt: new Date(),
  } as any);
  await programRepo.save({
    id: btechProgramId, departmentId: cseDeptId.toString(), name: 'B.Tech CSE', orgId,
    createdAt: new Date(), updatedAt: new Date(),
  } as any);
  await cohortRepo.save({
    id: cohort2025Id, programId: btechProgramId.toString(), name: 'Batch 2025', orgId,
    createdAt: new Date(), updatedAt: new Date(),
  } as any);

  const rahulId = EntityId.create();
  const profSharmaId = EntityId.create();
  const tcsRecruiterId = EntityId.create();

  const rahul = new User({
    id: rahulId, email: 'rahul@vit.edu', name: 'Rahul Verma', role: 'student',
    status: 'active', emailVerified: true,
    createdAt: new Date(), updatedAt: new Date(),
  });

  const profSharma = new User({
    id: profSharmaId, email: 'sharma@vit.edu', name: 'Prof. Sharma', role: 'faculty',
    status: 'active', emailVerified: true,
    createdAt: new Date(), updatedAt: new Date(),
  });

  const tcsRecruiter = new User({
    id: tcsRecruiterId, email: 'recruiter@tcs.com', name: 'Priya Singh', role: 'company',
    status: 'active', emailVerified: true,
    createdAt: new Date(), updatedAt: new Date(),
  });

  rahul.setPassword(await hashPassword('password123'));
  profSharma.setPassword(await hashPassword('password123'));
  tcsRecruiter.setPassword(await hashPassword('password123'));

  await userRepo.save(rahul);
  await userRepo.save(profSharma);
  await userRepo.save(tcsRecruiter);
  console.log('[Demo Seed] Users created: Rahul, Prof. Sharma, Priya (TCS)');

  const pythonId = EntityId.create();
  const sqlId = EntityId.create();
  const reactId = EntityId.create();
  const dockerId = EntityId.create();
  const awsId = EntityId.create();

  const competencyRepo = new CompetencyRepository();
  const competencies = [
    { id: pythonId, name: 'Python Programming', slug: 'python-programming', type: 'technical' as const, domain: 'Programming', keywords: ['python'], aliases: [], evidenceTypes: ['assessment', 'project'], status: 'active', taxonomyVersion: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: sqlId, name: 'SQL & Databases', slug: 'sql-databases', type: 'technical' as const, domain: 'Data', keywords: ['sql'], aliases: [], evidenceTypes: ['assessment', 'certification'], status: 'active', taxonomyVersion: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: reactId, name: 'React.js', slug: 'reactjs', type: 'technical' as const, domain: 'Frontend', keywords: ['react'], aliases: [], evidenceTypes: ['assessment', 'project'], status: 'active', taxonomyVersion: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: dockerId, name: 'Docker & Containers', slug: 'docker-containers', type: 'technical' as const, domain: 'DevOps', keywords: ['docker'], aliases: [], evidenceTypes: ['assessment', 'certification'], status: 'active', taxonomyVersion: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: awsId, name: 'AWS Cloud', slug: 'aws-cloud', type: 'technical' as const, domain: 'Cloud', keywords: ['aws'], aliases: [], evidenceTypes: ['certification', 'assessment'], status: 'active', taxonomyVersion: 1, createdAt: new Date(), updatedAt: new Date() },
  ];

  for (const comp of competencies) {
    await competencyRepo.save(comp as any);
  }
  console.log('[Demo Seed] Competencies created');

  const createStudentCompetency = (competencyId: EntityId, proficiency: number, confidence: number, evidenceCount = 0): StudentCompetency => {
    const props: StudentCompetencyProps = {
      id: EntityId.create(), studentId: rahulId.toString(), competencyId: competencyId.toString(),
      proficiency, confidence, evidenceCount,
      lastAssessedAt: new Date(), calculationVersion: 1,
      createdAt: new Date(), updatedAt: new Date(),
    };
    return new StudentCompetency(props);
  };

  await studentCompetencyRepo.save(createStudentCompetency(pythonId, 82, 0.9, 3));
  await studentCompetencyRepo.save(createStudentCompetency(sqlId, 76, 0.85, 2));
  await studentCompetencyRepo.save(createStudentCompetency(reactId, 65, 0.8, 1));
  await studentCompetencyRepo.save(createStudentCompetency(dockerId, 35, 0.5, 0));
  await studentCompetencyRepo.save(createStudentCompetency(awsId, 25, 0.4, 0));
  console.log('[Demo Seed] Rahul initial competencies set (low Docker, AWS)');

  const dockerQuestions: Question[] = [
    {
      id: 'q1', competencyId: dockerId.toString(), type: 'multiple_choice',
      text: 'What is the primary purpose of a Dockerfile?',
      options: [
        { id: 'a', text: 'To run containers' },
        { id: 'b', text: 'To define how to build a Docker image' },
        { id: 'c', text: 'To orchestrate containers' },
        { id: 'd', text: 'To store container data' },
      ],
      correctAnswer: 'b', difficulty: 1, points: 10,
    },
    {
      id: 'q2', competencyId: dockerId.toString(), type: 'true_false',
      text: 'A Docker container includes the full OS kernel.',
      options: [
        { id: 'a', text: 'True' },
        { id: 'b', text: 'False' },
      ],
      correctAnswer: 'b', difficulty: 2, points: 10,
    },
  ];

  const dockerAssessment = new Assessment({
    id: EntityId.create(), title: 'Docker Fundamentals Assessment',
    description: 'Assess knowledge of Docker containers, images, and Dockerfiles.',
    competencyIds: [dockerId.toString()], questions: dockerQuestions,
    timeLimit: 15, passingScore: 60, maxAttempts: 3, cooldownHours: 0,
    difficulty: 'fixed', isPublished: true, status: 'published',
    createdBy: profSharmaId.toString(), orgId,
    createdAt: new Date(), updatedAt: new Date(),
  } as AssessmentProps);

  await assessmentRepo.save(dockerAssessment);
  await questionBankRepo.save({
    id: EntityId.create(), assessmentId: dockerAssessment.id.toString(),
    questions: dockerQuestions, createdAt: new Date(), updatedAt: new Date(),
  } as any);
  console.log('[Demo Seed] Docker assessment created');

  const attempt = new AssessmentAttempt({
    id: EntityId.create(), assessmentId: dockerAssessment.id.toString(),
    userId: rahulId.toString(), orgId,
    answers: [
      { questionId: 'q1', answer: 'b' },
      { questionId: 'q2', answer: 'b' },
    ],
    score: 0, percentage: 0, passed: false, competencyScores: [],
    startedAt: new Date(), completedAt: new Date(), status: 'completed',
  } as AssessmentAttemptProps);

  const scoreResult = attempt.calculateScore(dockerQuestions);
  if (!scoreResult.success) throw new Error('Failed to score attempt');
  await attemptRepo.save(attempt);

  const correct = attempt.competencyScores[0]?.questionsAnswered ?? dockerQuestions.length;
  const score = attempt.percentage ?? 100;
  console.log(`[Demo Seed] Rahul's Docker assessment score: ${score}% (${correct}/${dockerQuestions.length} correct)`);

  const dockerEvidence = new Evidence({
    id: EntityId.create(), ownerId: rahulId.toString(), competencyId: dockerId.toString(),
    type: 'assessment', title: 'Docker Fundamentals Assessment',
    description: `Scored ${score}% on Docker assessment`,
    proficiencyLevel: score, confidence: Math.min(1, correct / 3),
    verificationStatus: 'pending',
    metadata: { assessmentId: dockerAssessment.id.toString(), attemptId: attempt.id.toString(), score, questionsAnswered: correct },
    provenance: { source: 'assessment', sourceId: dockerAssessment.id.toString(), importedAt: new Date() },
    orgId, createdAt: new Date(), updatedAt: new Date(),
  } as any);

  await evidenceRepo.save(dockerEvidence);

  const verified = dockerEvidence.verify('system', 'Auto-verified from assessment');
  if (verified.success) await evidenceRepo.save(dockerEvidence);
  console.log('[Demo Seed] Docker evidence created and verified');

  const allDockerEvidence = await evidenceRepo.findByOwner(rahulId.toString());
  const dockerEv = allDockerEvidence.filter((e) => e.competencyId === dockerId.toString());
  const scoringEngine = new CompetencyScoringEngine();
  const existingDocker = await studentCompetencyRepo.findByStudentAndCompetency(rahulId.toString(), dockerId.toString());
  const recalcResult = scoringEngine.recalculateStudentCompetency(existingDocker as any, dockerEv as any);
  if (recalcResult.success) {
    await studentCompetencyRepo.save(recalcResult.value as any);
    console.log(`[Demo Seed] Docker proficiency recalculated: ${Math.round((recalcResult.value as any).proficiency)}`);
  }

  const awsEvidence = new Evidence({
    id: EntityId.create(), ownerId: rahulId.toString(), competencyId: awsId.toString(),
    type: 'certification', title: 'AWS Cloud Practitioner',
    description: 'Completed AWS Cloud Practitioner certification',
    proficiencyLevel: 60, confidence: 0.8, score: 85,
    verificationStatus: 'pending',
    metadata: { provider: 'AWS', certificateUrl: 'https://aws.cert/rahul' },
    provenance: { source: 'certification', sourceId: 'aws-cp-rahul', importedAt: new Date() },
    orgId, createdAt: new Date(), updatedAt: new Date(),
  } as any);

  await evidenceRepo.save(awsEvidence);
  const awsVerified = awsEvidence.verify('system', 'Certificate verified');
  if (awsVerified.success) await evidenceRepo.save(awsEvidence);

  const existingAws = await studentCompetencyRepo.findByStudentAndCompetency(rahulId.toString(), awsId.toString());
  const awsRecalcResult = scoringEngine.recalculateStudentCompetency(existingAws as any, [awsEvidence] as any);
  if (awsRecalcResult.success) {
    await studentCompetencyRepo.save(awsRecalcResult.value as any);
    console.log(`[Demo Seed] AWS proficiency recalculated: ${Math.round((awsRecalcResult.value as any).proficiency)}`);
  }

  console.log('\n=== DEMO SEED COMPLETE ===');
  console.log('Rahul Verma (student@vit.edu / password123)');
  console.log('  Initial: Docker 35%, AWS 25%');
  const dockerFinal = recalcResult.success ? Math.round((recalcResult.value as any).proficiency) : 'N/A';
  const awsFinal = awsRecalcResult.success ? Math.round((awsRecalcResult.value as any).proficiency) : 'N/A';
  console.log(`  After Docker assessment: Docker ${dockerFinal}%`);
  console.log(`  After AWS certification: AWS ${awsFinal}%`);
  console.log('\nVisit /api/v1/analytics/student/<rahulId> to see the dashboard');
  console.log('Run backend with: npm run dev');

  await disconnectDatabase();
}

main().catch((err) => {
  console.error('[Demo Seed] Failed:', err);
  process.exit(1);
});
