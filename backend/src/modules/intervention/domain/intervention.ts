import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';
import { InterventionType, INTERVENTION_TRANSITIONS } from '../../../shared/domain/value-objects.js';
import { isValidTransition } from '../../../shared/domain/value-objects.js';

export interface CompetencyTarget {
  competencyId: string;
  targetLevel: number;
}

export interface InterventionProps {
  id: EntityId;
  title: string;
  description: string;
  type: InterventionType;
  competencyIds: string[];
  competencyTargets: CompetencyTarget[];
  startDate: Date;
  endDate: Date;
  capacity: number;
  enrolledCount: number;
  status: string;
  createdBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Intervention extends AggregateRoot<EntityId> {
  readonly title: string;
  readonly description: string;
  readonly type: InterventionType;
  readonly competencyIds: string[];
  readonly competencyTargets: CompetencyTarget[];
  readonly startDate: Date;
  readonly endDate: Date;
  readonly capacity: number;
  private _enrolledCount: number;
  private _status: string;
  readonly createdBy: string;
  readonly orgId: string;

  constructor(props: InterventionProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.title = props.title;
    this.description = props.description;
    this.type = props.type;
    this.competencyIds = props.competencyIds;
    this.competencyTargets = props.competencyTargets;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.capacity = props.capacity;
    this._enrolledCount = props.enrolledCount;
    this._status = props.status;
    this.createdBy = props.createdBy;
    this.orgId = props.orgId;
  }

  get status(): string {
    return this._status;
  }

  get enrolledCount(): number {
    return this._enrolledCount;
  }

  get isFull(): boolean {
    return this._enrolledCount >= this.capacity;
  }

  publish(): Result<void> {
    if (!isValidTransition(this._status, 'active', INTERVENTION_TRANSITIONS)) {
      return err(new InvariantError(`Cannot publish intervention from status: ${this._status}`));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'InterventionPublished',
        aggregateId: this.id.toString(),
        aggregateType: 'Intervention',
        payload: {
          interventionId: this.id.toString(),
          title: this.title,
          type: this.type,
          competencyIds: this.competencyIds,
          startDate: this.startDate,
          endDate: this.endDate,
        },
        orgId: this.orgId,
        actorId: this.createdBy,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  complete(): Result<void> {
    if (!isValidTransition(this._status, 'completed', INTERVENTION_TRANSITIONS)) {
      return err(new InvariantError(`Cannot complete intervention from status: ${this._status}`));
    }
    this._status = 'completed';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'InterventionCompleted',
        aggregateId: this.id.toString(),
        aggregateType: 'Intervention',
        payload: {
          interventionId: this.id.toString(),
          title: this.title,
          enrolledCount: this._enrolledCount,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  cancel(): Result<void> {
    if (!isValidTransition(this._status, 'cancelled', INTERVENTION_TRANSITIONS)) {
      return err(new InvariantError(`Cannot cancel intervention from status: ${this._status}`));
    }
    this._status = 'cancelled';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'InterventionCancelled',
        aggregateId: this.id.toString(),
        aggregateType: 'Intervention',
        payload: {
          interventionId: this.id.toString(),
          title: this.title,
          enrolledCount: this._enrolledCount,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  enrollStudent(): Result<void> {
    if (this._status !== 'active') {
      return err(new InvariantError('Cannot enroll in an intervention that is not active'));
    }
    if (this.isFull) {
      return err(new InvariantError('Intervention is at full capacity'));
    }
    this._enrolledCount += 1;
    this.updatedAt = new Date();
    return ok(undefined);
  }

  incrementEnrollment(): void {
    this._enrolledCount += 1;
    this.updatedAt = new Date();
  }

  decrementEnrollment(): void {
    if (this._enrolledCount > 0) {
      this._enrolledCount -= 1;
      this.updatedAt = new Date();
    }
  }
}

export interface EnrollmentProps {
  id: EntityId;
  interventionId: string;
  studentId: string;
  status: string;
  enrolledAt: Date;
  completedAt?: Date;
  notes?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ENROLLMENT_TRANSITIONS: Record<string, string[]> = {
  enrolled: ['in_progress', 'dropped', 'no_show'],
  in_progress: ['completed', 'dropped', 'no_show'],
  completed: [],
  dropped: [],
  no_show: [],
};

export class Enrollment extends AggregateRoot<EntityId> {
  readonly interventionId: string;
  readonly studentId: string;
  private _status: string;
  readonly enrolledAt: Date;
  private _completedAt?: Date;
  private _notes?: string;
  readonly orgId: string;

  constructor(props: EnrollmentProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.interventionId = props.interventionId;
    this.studentId = props.studentId;
    this._status = props.status;
    this.enrolledAt = props.enrolledAt;
    this._completedAt = props.completedAt;
    this._notes = props.notes;
    this.orgId = props.orgId;
  }

  get status(): string {
    return this._status;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  transitionTo(nextStatus: string, actorId?: string): Result<void> {
    if (!isValidTransition(this._status, nextStatus, ENROLLMENT_TRANSITIONS)) {
      return err(
        new InvariantError(
          `Invalid enrollment transition from ${this._status} to ${nextStatus}`
        )
      );
    }
    const oldStatus = this._status;
    this._status = nextStatus;
    this.updatedAt = new Date();

    if (nextStatus === 'completed') {
      this._completedAt = new Date();
    }

    this.addDomainEvent(
      createDomainEvent({
        eventType: 'EnrollmentStatusChanged',
        aggregateId: this.id.toString(),
        aggregateType: 'Enrollment',
        payload: {
          enrollmentId: this.id.toString(),
          interventionId: this.interventionId,
          studentId: this.studentId,
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

  startProgress(): Result<void> {
    return this.transitionTo('in_progress');
  }

  complete(): Result<void> {
    return this.transitionTo('completed');
  }

  drop(): Result<void> {
    return this.transitionTo('dropped');
  }

  markNoShow(): Result<void> {
    return this.transitionTo('no_show');
  }

  isTerminal(): boolean {
    return ['completed', 'dropped', 'no_show'].includes(this._status);
  }

  updateNotes(notes: string): void {
    this._notes = notes;
    this.updatedAt = new Date();
  }
}

export interface OutcomeProps {
  id: EntityId;
  interventionId: string;
  enrollmentId?: string;
  studentId: string;
  competencyId: string;
  beforeLevel: number;
  afterLevel: number;
  beforeConfidence: number;
  afterConfidence: number;
  measuredAt: Date;
  notes?: string;
  orgId: string;
  // Structured audit — not free-form notes
  competencyResults?: Array<{ competencyId: string; beforeLevel: number; afterLevel: number; improvement: number }>;
  matchImpact?: { opportunityId?: string; previousScore?: number; currentScore?: number; algorithmVersion?: string };
  postAssessmentAttemptId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Outcome extends AggregateRoot<EntityId> {
  readonly interventionId: string;
  readonly enrollmentId?: string;
  readonly studentId: string;
  readonly competencyId: string;
  readonly beforeLevel: number;
  readonly afterLevel: number;
  readonly beforeConfidence: number;
  readonly afterConfidence: number;
  readonly measuredAt: Date;
  readonly notes?: string;
  readonly orgId: string;
  readonly competencyResults?: OutcomeProps['competencyResults'];
  readonly matchImpact?: OutcomeProps['matchImpact'];
  readonly postAssessmentAttemptId?: string;

  constructor(props: OutcomeProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.interventionId = props.interventionId;
    this.enrollmentId = props.enrollmentId;
    this.studentId = props.studentId;
    this.competencyId = props.competencyId;
    this.beforeLevel = props.beforeLevel;
    this.afterLevel = props.afterLevel;
    this.beforeConfidence = props.beforeConfidence;
    this.afterConfidence = props.afterConfidence;
    this.measuredAt = props.measuredAt;
    this.notes = props.notes;
    this.orgId = props.orgId;
    this.competencyResults = props.competencyResults;
    this.matchImpact = props.matchImpact;
    this.postAssessmentAttemptId = props.postAssessmentAttemptId;
  }

  get levelImprovement(): number {
    return this.afterLevel - this.beforeLevel;
  }

  get confidenceImprovement(): number {
    return this.afterConfidence - this.beforeConfidence;
  }

  get isImprovement(): boolean {
    return this.afterLevel > this.beforeLevel;
  }
}

export { INTERVENTION_TRANSITIONS };
