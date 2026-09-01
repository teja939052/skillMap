import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';
import { OpportunityType, OPPORTUNITY_TRANSITIONS } from '../../../shared/domain/value-objects.js';
import { isValidTransition } from '../../../shared/domain/value-objects.js';

export interface OpportunityRequirement {
  competencyId: string;
  targetLevel: number;
  importance: 'must_have' | 'nice_to_have' | 'bonus';
  weight: number;
}

export interface OpportunityProps {
  id: EntityId;
  title: string;
  description: string;
  type: OpportunityType;
  organizationId: string;
  requirements: OpportunityRequirement[];
  eligibility: {
    minGpa?: number;
    departments?: string[];
    yearsOfStudy?: number[];
    graduationYearRange?: { min?: number; max?: number };
    locations?: string[];
    remote?: boolean;
  };
  compensation?: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
  };
  deadline?: Date;
  startDate?: Date;
  duration?: string;
  positions: number;
  status: string;
  createdBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Opportunity extends AggregateRoot<EntityId> {
  readonly title: string;
  readonly description: string;
  readonly type: OpportunityType;
  readonly organizationId: string;
  readonly requirements: OpportunityRequirement[];
  readonly eligibility: OpportunityProps['eligibility'];
  readonly compensation?: OpportunityProps['compensation'];
  readonly deadline?: Date;
  readonly startDate?: Date;
  readonly duration?: string;
  readonly positions: number;
  private _status: string;
  readonly createdBy: string;
  readonly orgId: string;

  constructor(props: OpportunityProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.title = props.title;
    this.description = props.description;
    this.type = props.type;
    this.organizationId = props.organizationId;
    this.requirements = props.requirements;
    this.eligibility = props.eligibility;
    this.compensation = props.compensation;
    this.deadline = props.deadline;
    this.startDate = props.startDate;
    this.duration = props.duration;
    this.positions = positions;
    this._status = props.status;
    this.createdBy = props.createdBy;
    this.orgId = props.orgId;
  }

  get status(): string {
    return this._status;
  }

  publish(): Result<void> {
    if (!isValidTransition(this._status, 'open', OPPORTUNITY_TRANSITIONS)) {
      return err(new InvariantError(`Cannot publish opportunity from status: ${this._status}`));
    }
    this._status = 'open';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'OpportunityPublished',
        aggregateId: this.id.toString(),
        aggregateType: 'Opportunity',
        payload: {
          opportunityId: this.id.toString(),
          title: this.title,
          type: this.type,
          organizationId: this.organizationId,
          requirements: this.requirements,
        },
        orgId: this.orgId,
        actorId: this.createdBy,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  close(): Result<void> {
    if (!isValidTransition(this._status, 'closed', OPPORTUNITY_TRANSITIONS)) {
      return err(new InvariantError(`Cannot close opportunity from status: ${this._status}`));
    }
    this._status = 'closed';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'OpportunityClosed',
        aggregateId: this.id.toString(),
        aggregateType: 'Opportunity',
        payload: { opportunityId: this.id.toString(), title: this.title },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  isOpen(): boolean {
    if (this._status !== 'open') return false;
    if (this.deadline && new Date(this.deadline) < new Date()) return false;
    return true;
  }
}

const positions = 1;

export { OPPORTUNITY_TRANSITIONS };
