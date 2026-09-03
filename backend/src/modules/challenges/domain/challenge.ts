import { EntityId } from '../../../shared/domain/entity.js';

export interface ChallengeRequirement {
  competencyId: string;
  minLevel: number;
  weight: number;
}

export interface ChallengeProps {
  id: EntityId;
  title: string;
  description: string;
  companyName: string;
  postedBy: string;
  orgId: string;
  requiredSkills: ChallengeRequirement[];
  durationDays: number;
  reward?: number;
  currency: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  deliverables: string[];
  status: 'open' | 'active' | 'evaluating' | 'completed' | 'cancelled';
  submissionsCount: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeSubmissionProps {
  id: EntityId;
  challengeId: string;
  studentId: string;
  message: string;
  artifactUrl?: string;
  status: 'submitted' | 'evaluated' | 'accepted' | 'rejected';
  evaluationScore?: number;
  evaluationFeedback?: string;
  evaluatedBy?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class IndustryChallenge {
  readonly id: EntityId;
  readonly title: string;
  readonly description: string;
  readonly companyName: string;
  readonly postedBy: string;
  readonly orgId: string;
  readonly requiredSkills: ChallengeRequirement[];
  readonly durationDays: number;
  readonly reward?: number;
  readonly currency: string;
  readonly difficulty: ChallengeProps['difficulty'];
  readonly deliverables: string[];
  status: string;
  submissionsCount: number;
  readonly deadline?: Date;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: ChallengeProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.companyName = props.companyName;
    this.postedBy = props.postedBy;
    this.orgId = props.orgId;
    this.requiredSkills = props.requiredSkills;
    this.durationDays = props.durationDays;
    this.reward = props.reward;
    this.currency = props.currency;
    this.difficulty = props.difficulty;
    this.deliverables = props.deliverables;
    this.status = props.status;
    this.submissionsCount = props.submissionsCount;
    this.deadline = props.deadline;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOpen(): boolean {
    if (this.status !== 'open') return false;
    if (this.deadline && new Date(this.deadline) < new Date()) return false;
    return true;
  }
}

export class ChallengeSubmission {
  readonly id: EntityId;
  readonly challengeId: string;
  readonly studentId: string;
  readonly message: string;
  readonly artifactUrl?: string;
  status: string;
  readonly evaluationScore?: number;
  readonly evaluationFeedback?: string;
  readonly evaluatedBy?: string;
  readonly orgId: string;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: ChallengeSubmissionProps) {
    this.id = props.id;
    this.challengeId = props.challengeId;
    this.studentId = props.studentId;
    this.message = props.message;
    this.artifactUrl = props.artifactUrl;
    this.status = props.status;
    this.evaluationScore = props.evaluationScore;
    this.evaluationFeedback = props.evaluationFeedback;
    this.evaluatedBy = props.evaluatedBy;
    this.orgId = props.orgId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
