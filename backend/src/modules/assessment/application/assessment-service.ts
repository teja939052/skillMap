import { ObjectId } from 'mongodb';
import { EntityId } from '../../../shared/domain/entity.js';
import {
  Result,
  ok,
  err,
  NotFoundError,
  ConflictError,
  ValidationError,
  InvariantError,
} from '../../../shared/domain/result.js';
import {
  Assessment,
  AssessmentAttempt,
  QuestionBank,
  Question,
  Answer,
  CompetencyScore,
} from '../domain/assessment.js';
import {
  AssessmentRepository,
  AssessmentAttemptRepository,
  QuestionBankRepository,
} from '../infrastructure/repositories.js';
import { EvidenceService } from '../../evidence/application/evidence-service.js';
import { StudentCompetencyService } from '../../competency/application/competency-service.js';

export interface CreateAssessmentData {
  title: string;
  description: string;
  competencyIds: string[];
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  cooldownHours: number;
  difficulty: 'adaptive' | 'fixed';
  orgId: string;
}

export interface UpdateAssessmentData {
  title?: string;
  description?: string;
  competencyIds?: string[];
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  cooldownHours?: number;
  difficulty?: 'adaptive' | 'fixed';
}

export interface ListAssessmentFilters {
  status?: string;
  isPublished?: boolean;
  competencyId?: string;
  orgId: string;
}

export interface SubmitAttemptData {
  answers: Answer[];
}

export interface CreateQuestionData {
  competencyId: string;
  type: 'multiple_choice' | 'multi_select' | 'true_false' | 'short_answer' | 'coding';
  text: string;
  options?: Array<{ id: string; text: string }>;
  correctAnswer: string | string[];
  difficulty: number;
  points: number;
  explanation?: string;
}

export class AssessmentService {
  constructor(
    private readonly assessmentRepo: AssessmentRepository,
    private readonly attemptRepo: AssessmentAttemptRepository,
    private readonly questionBankRepo: QuestionBankRepository,
    private readonly evidenceService: EvidenceService,
    private readonly competencyService: StudentCompetencyService
  ) {}

  async createAssessment(data: CreateAssessmentData, userId: string): Promise<Result<Assessment>> {
    if (!data.title || data.title.trim().length === 0) {
      return err(new ValidationError('Title is required'));
    }
    if (!data.competencyIds || data.competencyIds.length === 0) {
      return err(new ValidationError('At least one competency is required'));
    }
    if (data.passingScore < 0 || data.passingScore > 100) {
      return err(new ValidationError('Passing score must be between 0 and 100'));
    }
    if (data.maxAttempts < 1) {
      return err(new ValidationError('Max attempts must be at least 1'));
    }
    if (data.cooldownHours < 0) {
      return err(new ValidationError('Cooldown hours cannot be negative'));
    }

    const assessment = new Assessment({
      id: EntityId.create(),
      title: data.title,
      description: data.description,
      competencyIds: data.competencyIds,
      questions: [],
      timeLimit: data.timeLimit,
      passingScore: data.passingScore,
      maxAttempts: data.maxAttempts,
      cooldownHours: data.cooldownHours,
      difficulty: data.difficulty,
      isPublished: false,
      status: 'draft',
      createdBy: userId,
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.assessmentRepo.save(assessment);
    return ok(assessment);
  }

  async getById(id: string, includeAnswers = false): Promise<Result<Assessment>> {
    const assessment = await this.assessmentRepo.findEntityById(id);
    if (!assessment) {
      return err(new NotFoundError('Assessment', id));
    }
    if (!includeAnswers) {
      const stripped = assessment.stripCorrectAnswers();
      const assessmentCopy = new Assessment({
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        competencyIds: assessment.competencyIds,
        questions: stripped,
        timeLimit: assessment.timeLimit,
        passingScore: assessment.passingScore,
        maxAttempts: assessment.maxAttempts,
        cooldownHours: assessment.cooldownHours,
        difficulty: assessment.difficulty,
        isPublished: assessment.isPublished,
        status: assessment.status,
        createdBy: assessment.createdBy,
        orgId: assessment.orgId,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      });
      return ok(assessmentCopy);
    }
    return ok(assessment);
  }

  async updateAssessment(id: string, updates: UpdateAssessmentData): Promise<Result<Assessment>> {
    const assessment = await this.assessmentRepo.findEntityById(id);
    if (!assessment) {
      return err(new NotFoundError('Assessment', id));
    }

    if (assessment.status === 'archived') {
      return err(new ConflictError('Cannot update an archived assessment'));
    }

    if (updates.passingScore !== undefined && (updates.passingScore < 0 || updates.passingScore > 100)) {
      return err(new ValidationError('Passing score must be between 0 and 100'));
    }
    if (updates.maxAttempts !== undefined && updates.maxAttempts < 1) {
      return err(new ValidationError('Max attempts must be at least 1'));
    }
    if (updates.cooldownHours !== undefined && updates.cooldownHours < 0) {
      return err(new ValidationError('Cooldown hours cannot be negative'));
    }

    const updated = new Assessment({
      id: assessment.id,
      title: updates.title ?? assessment.title,
      description: updates.description ?? assessment.description,
      competencyIds: updates.competencyIds ?? assessment.competencyIds,
      questions: assessment.questions,
      timeLimit: updates.timeLimit ?? assessment.timeLimit,
      passingScore: updates.passingScore ?? assessment.passingScore,
      maxAttempts: updates.maxAttempts ?? assessment.maxAttempts,
      cooldownHours: updates.cooldownHours ?? assessment.cooldownHours,
      difficulty: updates.difficulty ?? assessment.difficulty,
      isPublished: assessment.isPublished,
      status: assessment.status,
      createdBy: assessment.createdBy,
      orgId: assessment.orgId,
      createdAt: assessment.createdAt,
      updatedAt: new Date(),
    });

    await this.assessmentRepo.save(updated);
    return ok(updated);
  }

  async publishAssessment(id: string): Promise<Result<Assessment>> {
    const assessment = await this.assessmentRepo.findEntityById(id);
    if (!assessment) {
      return err(new NotFoundError('Assessment', id));
    }

    const result = assessment.publish();
    if (!result.success) {
      return result;
    }

    await this.assessmentRepo.save(assessment);
    return ok(assessment);
  }

  async listAssessments(filters: ListAssessmentFilters): Promise<Result<Assessment[]>> {
    const assessments = await this.assessmentRepo.findByOrg(filters.orgId, {
      status: filters.status,
      isPublished: filters.isPublished,
    });

    if (filters.competencyId) {
      const filtered = assessments.filter((a) => a.competencyIds.includes(filters.competencyId!));
      return ok(filtered);
    }

    return ok(assessments);
  }

  async addQuestion(assessmentId: string, questionData: CreateQuestionData): Promise<Result<Assessment>> {
    const assessment = await this.assessmentRepo.findEntityById(assessmentId);
    if (!assessment) {
      return err(new NotFoundError('Assessment', assessmentId));
    }

    const question: Question = {
      id: EntityId.create().toString(),
      competencyId: questionData.competencyId,
      type: questionData.type,
      text: questionData.text,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      difficulty: questionData.difficulty,
      points: questionData.points,
      explanation: questionData.explanation,
    };

    const result = assessment.addQuestion(question);
    if (!result.success) {
      return result;
    }

    await this.assessmentRepo.save(assessment);
    return ok(assessment);
  }

  async removeQuestion(assessmentId: string, questionId: string): Promise<Result<Assessment>> {
    const assessment = await this.assessmentRepo.findEntityById(assessmentId);
    if (!assessment) {
      return err(new NotFoundError('Assessment', assessmentId));
    }

    const result = assessment.removeQuestion(questionId);
    if (!result.success) {
      return result;
    }

    await this.assessmentRepo.save(assessment);
    return ok(assessment);
  }

  async startAttempt(assessmentId: string, userId: string): Promise<Result<AssessmentAttempt>> {
    const assessment = await this.assessmentRepo.findEntityById(assessmentId);
    if (!assessment) {
      return err(new NotFoundError('Assessment', assessmentId));
    }

    if (!assessment.isPublished) {
      return err(new ConflictError('Assessment is not published'));
    }

    const attemptCount = await this.attemptRepo.countByUserAndAssessment(userId, assessmentId);
    if (attemptCount >= assessment.maxAttempts) {
      return err(new ConflictError(`Maximum attempts (${assessment.maxAttempts}) reached`));
    }

    const latestAttempt = await this.attemptRepo.findLatestByUserAndAssessment(userId, assessmentId);
    if (latestAttempt && latestAttempt.status === 'in_progress') {
      return err(new ConflictError('You already have an in-progress attempt'));
    }

    if (latestAttempt && latestAttempt.completedAt && assessment.cooldownHours > 0) {
      const cooldownMs = assessment.cooldownHours * 60 * 60 * 1000;
      const elapsed = Date.now() - new Date(latestAttempt.completedAt).getTime();
      if (elapsed < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - elapsed) / (60 * 1000));
        return err(new ConflictError(`Cooldown period active. Try again in ${remainingMinutes} minutes`));
      }
    }

    const attempt = new AssessmentAttempt({
      id: EntityId.create(),
      assessmentId,
      userId,
      answers: [],
      score: 0,
      percentage: 0,
      passed: false,
      competencyScores: [],
      startedAt: new Date(),
      status: 'in_progress',
      orgId: assessment.orgId,
      assessmentVersion: assessment.version,
      questionVersion: 1,
      scoringVersion: 2,
      adaptiveTrace: Object.fromEntries(assessment.competencyIds.map((cid) => [cid, [3]])),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.attemptRepo.save(attempt);
    return ok(attempt);
  }

  async submitAttempt(attemptId: string, data: SubmitAttemptData): Promise<Result<AssessmentAttempt>> {
    const attempt = await this.attemptRepo.findEntityById(attemptId);
    if (!attempt) {
      return err(new NotFoundError('AssessmentAttempt', attemptId));
    }

    if (attempt.status !== 'in_progress') {
      return err(new ConflictError('Attempt is not in progress'));
    }

    const assessment = await this.assessmentRepo.findEntityById(attempt.assessmentId);
    if (!assessment) {
      return err(new NotFoundError('Assessment', attempt.assessmentId));
    }

    const updatedAttempt = new AssessmentAttempt({
      id: attempt.id,
      assessmentId: attempt.assessmentId,
      userId: attempt.userId,
      answers: data.answers,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      competencyScores: attempt.competencyScores,
      startedAt: attempt.startedAt,
      status: attempt.status,
      orgId: attempt.orgId,
      createdAt: attempt.createdAt,
      updatedAt: new Date(),
    });

    const scoreResult = updatedAttempt.calculateScore(assessment.questions);
    if (!scoreResult.success) {
      return scoreResult;
    }

    const totalPoints = assessment.getTotalPoints();
    const passingPoints = Math.round((assessment.passingScore / 100) * totalPoints);
    const passed = updatedAttempt.score >= passingPoints;

    const adaptiveTrace: Record<string, number[]> = { ...(attempt as any).adaptiveTrace || {} };
    for (const cs of updatedAttempt.competencyScores) {
      const nextDiff = cs.score >= 80 ? 5 : cs.score >= 60 ? 4 : cs.score >= 40 ? 3 : 2;
      adaptiveTrace[cs.competencyId] = [...(adaptiveTrace[cs.competencyId] || [3]), nextDiff];
    }
    const finalAttempt = new AssessmentAttempt({
      id: updatedAttempt.id,
      assessmentId: updatedAttempt.assessmentId,
      userId: updatedAttempt.userId,
      answers: updatedAttempt.answers,
      score: updatedAttempt.score,
      percentage: updatedAttempt.percentage,
      passed,
      competencyScores: updatedAttempt.competencyScores,
      startedAt: updatedAttempt.startedAt,
      status: 'completed',
      orgId: updatedAttempt.orgId,
      assessmentVersion: (attempt as any).assessmentVersion ?? 1,
      questionVersion: (attempt as any).questionVersion ?? 1,
      scoringVersion: 2,
      adaptiveTrace,
      createdAt: updatedAttempt.createdAt,
      updatedAt: new Date(),
    });

    const submitResult = finalAttempt.submit();
    if (!submitResult.success) {
      return submitResult as Result<AssessmentAttempt>;
    }

    await this.attemptRepo.save(finalAttempt);

    const evidencePromises = finalAttempt.competencyScores.map((cs) =>
      this.evidenceService.create(
        {
          ownerId: finalAttempt.userId,
          competencyId: cs.competencyId,
          type: 'assessment',
          title: `Assessment: ${assessment.title}`,
          description: `Score: ${cs.score}% on ${cs.questionsAnswered} questions`,
          proficiencyLevel: cs.score,
          confidence: Math.min(1, cs.questionsAnswered / 5),
          source: 'assessment',
          sourceId: finalAttempt.assessmentId,
          orgId: finalAttempt.orgId,
        },
        finalAttempt.userId
      )
    );

    const evidenceResults = await Promise.all(evidencePromises);

    for (const result of evidenceResults) {
      if (result.success) {
        await this.evidenceService.verify(result.value.id.toString(), 'system', { notes: 'Auto-verified from assessment' });
      }
    }

    await this.competencyService.recalculateFromEvidence(finalAttempt.userId);

    return ok(finalAttempt);
  }

  async getAttemptHistory(userId: string, assessmentId?: string): Promise<Result<AssessmentAttempt[]>> {
    const attempts = await this.attemptRepo.findByUser(userId, assessmentId);
    return ok(attempts);
  }

  async getAttemptById(attemptId: string): Promise<Result<AssessmentAttempt>> {
    const attempt = await this.attemptRepo.findEntityById(attemptId);
    if (!attempt) {
      return err(new NotFoundError('AssessmentAttempt', attemptId));
    }
    return ok(attempt);
  }

  async getCompetencyScores(userId: string): Promise<Result<CompetencyScore[]>> {
    const attempts = await this.attemptRepo.findByUser(userId);
    const completedAttempts = attempts.filter((a) => a.status === 'completed');

    if (completedAttempts.length === 0) {
      return ok([]);
    }

    const competencyMap: Record<string, { totalScore: number; count: number }> = {};

    for (const attempt of completedAttempts) {
      for (const cs of attempt.competencyScores) {
        if (!competencyMap[cs.competencyId]) {
          competencyMap[cs.competencyId] = { totalScore: 0, count: 0 };
        }
        competencyMap[cs.competencyId].totalScore += cs.score;
        competencyMap[cs.competencyId].count += 1;
      }
    }

    const scores: CompetencyScore[] = Object.entries(competencyMap).map(([competencyId, data]) => ({
      competencyId,
      score: Math.round(data.totalScore / data.count),
      questionsAnswered: data.count,
    }));

    return ok(scores);
  }

  async addQuestionToBank(competencyId: string, questionData: CreateQuestionData, userId: string, orgId: string): Promise<Result<QuestionBank>> {
    let bank = await this.questionBankRepo.findByCompetency(competencyId, orgId);

    if (!bank) {
      bank = new QuestionBank({
        id: EntityId.create(),
        competencyId,
        questions: [],
        totalQuestions: 0,
        createdBy: userId,
        orgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const question: Question = {
      id: EntityId.create().toString(),
      competencyId: questionData.competencyId,
      type: questionData.type,
      text: questionData.text,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      difficulty: questionData.difficulty,
      points: questionData.points,
      explanation: questionData.explanation,
    };

    const result = bank.addQuestion(question);
    if (!result.success) {
      return result;
    }

    await this.questionBankRepo.save(bank);
    return ok(bank);
  }

  async getQuestionsFromBank(competencyId: string, count: number, difficulty?: number, orgId?: string): Promise<Result<Question[]>> {
    let bank: QuestionBank | null = null;
    if (orgId) {
      bank = await this.questionBankRepo.findByCompetency(competencyId, orgId);
    } else {
      const banks = await this.questionBankRepo.findByOrg('');
      bank = banks.find((b) => b.competencyId === competencyId) ?? null;
    }

    if (!bank) {
      return err(new NotFoundError('QuestionBank', competencyId));
    }

    return bank.getRandomQuestions(count, difficulty);
  }
}
