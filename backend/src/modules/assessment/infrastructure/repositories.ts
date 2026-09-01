import { Repository } from '../../../shared/persistence/repository.js';
import {
  Assessment,
  AssessmentAttempt,
  QuestionBank,
  Question,
  Answer,
  CompetencyScore,
} from '../domain/assessment.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface AssessmentDocument {
  _id: string;
  title: string;
  description: string;
  competencyIds: string[];
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  cooldownHours: number;
  difficulty: 'adaptive' | 'fixed';
  isPublished: boolean;
  status: string;
  createdBy: string;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class AssessmentRepository extends Repository<AssessmentDocument> {
  protected collectionName = 'assessments';

  async findEntityById(id: string): Promise<Assessment | null> {
    const doc = await super.findByIdPublic(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByOrg(orgId: string, filters?: { status?: string; isPublished?: boolean }): Promise<Assessment[]> {
    const filter: Record<string, unknown> = { orgId };
    if (filters?.status) filter.status = filters.status;
    if (filters?.isPublished !== undefined) filter.isPublished = filters.isPublished;
    const docs = await this.find(filter as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCompetency(competencyId: string, orgId: string): Promise<Assessment[]> {
    const docs = await this.find({ competencyIds: competencyId, orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(assessment: Assessment): Promise<void> {
    const doc = this.toDocument(assessment);
    await this.collection.updateOne(
      { _id: assessment.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: AssessmentDocument): Assessment {
    return new Assessment({
      id: EntityId.fromString(doc._id.toString()),
      title: doc.title,
      description: doc.description,
      competencyIds: doc.competencyIds || [],
      questions: doc.questions || [],
      timeLimit: doc.timeLimit,
      passingScore: doc.passingScore,
      maxAttempts: doc.maxAttempts,
      cooldownHours: doc.cooldownHours,
      difficulty: doc.difficulty as any,
      isPublished: doc.isPublished,
      status: doc.status as any,
      createdBy: doc.createdBy,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(a: Assessment): AssessmentDocument {
    return {
      _id: a.id.toString(),
      title: a.title,
      description: a.description,
      competencyIds: a.competencyIds,
      questions: a.questions,
      timeLimit: a.timeLimit,
      passingScore: a.passingScore,
      maxAttempts: a.maxAttempts,
      cooldownHours: a.cooldownHours,
      difficulty: a.difficulty,
      isPublished: a.isPublished,
      status: a.status,
      createdBy: a.createdBy,
      orgId: a.orgId,
      version: a.version,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: null,
    };
  }
}

export interface AssessmentAttemptDocument {
  _id: string;
  assessmentId: string;
  userId: string;
  answers: Answer[];
  score: number;
  percentage: number;
  passed: boolean;
  competencyScores: CompetencyScore[];
  startedAt: Date;
  completedAt?: Date;
  status: string;
  orgId: string;
  assessmentVersion?: number;
  questionVersion?: number;
  scoringVersion?: number;
  adaptiveTrace?: Record<string, number[]>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class AssessmentAttemptRepository extends Repository<AssessmentAttemptDocument> {
  protected collectionName = 'assessment_attempts';

  async findEntityById(id: string): Promise<AssessmentAttempt | null> {
    const doc = await super.findByIdPublic(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUser(userId: string, assessmentId?: string): Promise<AssessmentAttempt[]> {
    const filter: Record<string, unknown> = { userId };
    if (assessmentId) filter.assessmentId = assessmentId;
    const docs = await this.find(filter as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByAssessment(assessmentId: string): Promise<AssessmentAttempt[]> {
    const docs = await this.find({ assessmentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async countByUserAndAssessment(userId: string, assessmentId: string): Promise<number> {
    return this.count({ userId, assessmentId } as any);
  }

  async findLatestByUserAndAssessment(userId: string, assessmentId: string): Promise<AssessmentAttempt | null> {
    const docs = await this.find({ userId, assessmentId } as any);
    if (docs.length === 0) return null;
    const sorted = docs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return this.toEntity(sorted[0]);
  }

  async save(attempt: AssessmentAttempt): Promise<void> {
    const doc = this.toDocument(attempt);
    await this.collection.updateOne(
      { _id: attempt.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: AssessmentAttemptDocument): AssessmentAttempt {
    return new AssessmentAttempt({
      id: EntityId.fromString(doc._id.toString()),
      assessmentId: doc.assessmentId,
      userId: doc.userId,
      answers: doc.answers || [],
      score: doc.score,
      percentage: doc.percentage,
      passed: doc.passed,
      competencyScores: doc.competencyScores || [],
      startedAt: doc.startedAt,
      completedAt: doc.completedAt,
      status: doc.status as any,
      orgId: doc.orgId,
      assessmentVersion: (doc as any).assessmentVersion,
      questionVersion: (doc as any).questionVersion,
      scoringVersion: (doc as any).scoringVersion,
      adaptiveTrace: (doc as any).adaptiveTrace,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(a: AssessmentAttempt): AssessmentAttemptDocument {
    return {
      _id: a.id.toString(),
      assessmentId: a.assessmentId,
      userId: a.userId,
      answers: a.answers,
      score: a.score,
      percentage: a.percentage,
      passed: a.passed,
      competencyScores: a.competencyScores,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      status: a.status,
      orgId: a.orgId,
      assessmentVersion: (a as any).assessmentVersion,
      questionVersion: (a as any).questionVersion,
      scoringVersion: (a as any).scoringVersion,
      adaptiveTrace: (a as any).adaptiveTrace,
      version: a.version,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: null,
    };
  }
}

export interface QuestionBankDocument {
  _id: string;
  competencyId: string;
  questions: Question[];
  totalQuestions: number;
  createdBy: string;
  orgId: string;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class QuestionBankRepository extends Repository<QuestionBankDocument> {
  protected collectionName = 'question_banks';

  async findEntityById(id: string): Promise<QuestionBank | null> {
    const doc = await super.findByIdPublic(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByCompetency(competencyId: string, orgId: string): Promise<QuestionBank | null> {
    const doc = await this.findOne({ competencyId, orgId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByOrg(orgId: string): Promise<QuestionBank[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(bank: QuestionBank): Promise<void> {
    const doc = this.toDocument(bank);
    await this.collection.updateOne(
      { _id: bank.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: QuestionBankDocument): QuestionBank {
    return new QuestionBank({
      id: EntityId.fromString(doc._id.toString()),
      competencyId: doc.competencyId,
      questions: doc.questions || [],
      totalQuestions: doc.totalQuestions,
      createdBy: doc.createdBy,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(b: QuestionBank): QuestionBankDocument {
    return {
      _id: b.id.toString(),
      competencyId: b.competencyId,
      questions: b.questions,
      totalQuestions: b.totalQuestions,
      createdBy: b.createdBy,
      orgId: b.orgId,
      version: b.version,
      status: 'active',
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      deletedAt: null,
    };
  }
}
