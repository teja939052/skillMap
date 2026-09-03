import { Repository } from '../../../shared/persistence/repository.js';
import { EntityId } from '../../../shared/domain/entity.js';
import { IndustryChallenge, ChallengeSubmission, ChallengeProps, ChallengeSubmissionProps } from '../domain/challenge.js';

export interface ChallengeDocument {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  postedBy: string;
  orgId: string;
  requiredSkills: ChallengeProps['requiredSkills'];
  durationDays: number;
  reward?: number;
  currency: string;
  difficulty: string;
  deliverables: string[];
  status: string;
  submissionsCount: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface SubmissionDocument {
  _id: string;
  challengeId: string;
  studentId: string;
  message: string;
  artifactUrl?: string;
  status: string;
  evaluationScore?: number;
  evaluationFeedback?: string;
  evaluatedBy?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class ChallengeRepository extends Repository<ChallengeDocument> {
  protected collectionName = 'challenges';

  async findChallengeById(id: string): Promise<IndustryChallenge | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findChallenges(filter: any): Promise<IndustryChallenge[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(challenge: IndustryChallenge): Promise<void> {
    const doc = this.toDocument(challenge);
    await this.collection.updateOne({ _id: challenge.id.toString() } as any, { $set: doc }, { upsert: true });
  }

  private toEntity(d: ChallengeDocument): IndustryChallenge {
    return new IndustryChallenge({
      id: EntityId.fromString(d._id.toString()),
      title: d.title,
      description: d.description,
      companyName: d.companyName,
      postedBy: d.postedBy,
      orgId: d.orgId,
      requiredSkills: d.requiredSkills as any,
      durationDays: d.durationDays,
      reward: d.reward,
      currency: d.currency,
      difficulty: d.difficulty as any,
      deliverables: d.deliverables,
      status: d.status as any,
      submissionsCount: d.submissionsCount,
      deadline: d.deadline,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }

  private toDocument(c: IndustryChallenge): ChallengeDocument {
    return {
      _id: c.id.toString(),
      title: c.title,
      description: c.description,
      companyName: c.companyName,
      postedBy: c.postedBy,
      orgId: c.orgId,
      requiredSkills: c.requiredSkills,
      durationDays: c.durationDays,
      reward: c.reward,
      currency: c.currency,
      difficulty: c.difficulty,
      deliverables: c.deliverables,
      status: c.status,
      submissionsCount: c.submissionsCount,
      deadline: c.deadline,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      deletedAt: null,
    };
  }
}

export class ChallengeSubmissionRepository extends Repository<SubmissionDocument> {
  protected collectionName = 'challenge_submissions';

  async findSubmissionById(id: string): Promise<ChallengeSubmission | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findSubmissions(filter: any): Promise<ChallengeSubmission[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStudentAndChallenge(challengeId: string, studentId: string): Promise<ChallengeSubmission | null> {
    const doc = await this.findOne({ challengeId, studentId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async save(sub: ChallengeSubmission): Promise<void> {
    const doc = this.toDocument(sub);
    await this.collection.updateOne({ _id: sub.id.toString() } as any, { $set: doc }, { upsert: true });
  }

  private toEntity(d: SubmissionDocument): ChallengeSubmission {
    return new ChallengeSubmission({
      id: EntityId.fromString(d._id.toString()),
      challengeId: d.challengeId,
      studentId: d.studentId,
      message: d.message,
      artifactUrl: d.artifactUrl,
      status: d.status as any,
      evaluationScore: d.evaluationScore,
      evaluationFeedback: d.evaluationFeedback,
      evaluatedBy: d.evaluatedBy,
      orgId: d.orgId,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }

  private toDocument(s: ChallengeSubmission): SubmissionDocument {
    return {
      _id: s.id.toString(),
      challengeId: s.challengeId,
      studentId: s.studentId,
      message: s.message,
      artifactUrl: s.artifactUrl,
      status: s.status,
      evaluationScore: s.evaluationScore,
      evaluationFeedback: s.evaluationFeedback,
      evaluatedBy: s.evaluatedBy,
      orgId: s.orgId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      deletedAt: null,
    };
  }
}
