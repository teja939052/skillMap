import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';
import { isValidTransition, APPLICATION_TRANSITIONS } from '../../../shared/domain/value-objects.js';

export interface ApplicationProps {
  id: EntityId;
  opportunityId: string;
  applicantId: string;
  status: string;
  coverLetter?: string;
  answers: Array<{ question: string; answer: string }>;
  matchScore?: number;
  matchExplanation?: MatchExplanation;
  notes?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchExplanation {
  score: number;
  competencyScores: Array<{
    competencyId: string;
    requiredLevel: number;
    actualLevel: number;
    contribution: number;
    gap: number;
  }>;
  strengths: string[];
  gaps: string[];
  eligibilityPassed: boolean;
  calculatedAt: Date;
  algorithmVersion: string;
}

export class Application extends AggregateRoot<EntityId> {
  readonly opportunityId: string;
  readonly applicantId: string;
  private _status: string;
  readonly coverLetter?: string;
  readonly answers: Array<{ question: string; answer: string }>;
  private _matchScore?: number;
  private _matchExplanation?: MatchExplanation;
  private _notes?: string;
  readonly orgId: string;

  constructor(props: ApplicationProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.opportunityId = props.opportunityId;
    this.applicantId = props.applicantId;
    this._status = props.status;
    this.coverLetter = props.coverLetter;
    this.answers = props.answers;
    this._matchScore = props.matchScore;
    this._matchExplanation = props.matchExplanation;
    this._notes = props.notes;
    this.orgId = props.orgId;
  }

  get status(): string {
    return this._status;
  }

  get matchScore(): number | undefined {
    return this._matchScore;
  }

  get matchExplanation(): MatchExplanation | undefined {
    return this._matchExplanation;
  }

  setMatchResult(score: number, explanation: MatchExplanation): void {
    this._matchScore = score;
    this._matchExplanation = explanation;
    this.updatedAt = new Date();
  }

  transitionTo(nextStatus: string, actorId?: string): Result<void> {
    if (!isValidTransition(this._status, nextStatus, APPLICATION_TRANSITIONS)) {
      return err(
        new InvariantError(
          `Invalid transition from ${this._status} to ${nextStatus}`
        )
      );
    }
    const oldStatus = this._status;
    this._status = nextStatus;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ApplicationStageChanged',
        aggregateId: this.id.toString(),
        aggregateType: 'Application',
        payload: {
          applicationId: this.id.toString(),
          opportunityId: this.opportunityId,
          applicantId: this.applicantId,
          oldStatus,
          newStatus: nextStatus,
        },
        orgId: this.orgId,
        actorId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  withdraw(): Result<void> {
    return this.transitionTo('withdrawn');
  }

  reject(): Result<void> {
    return this.transitionTo('rejected');
  }

  isTerminal(): boolean {
    return ['accepted', 'declined', 'rejected', 'withdrawn', 'expired'].includes(this._status);
  }

  canBeWithdrawn(): boolean {
    return ['applied', 'under_review', 'shortlisted', 'interview'].includes(this._status);
  }
}
