import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError, ValidationError } from '../../../shared/domain/result.js';

export interface RoleRequirement {
  competencyId: string;
  competencyName: string;
  targetLevel: number;
  importance: 'required' | 'preferred' | 'bonus';
  weight: number;
  evidenceRule?: string;
  freshness?: number;
}

export interface EligibilityRules {
  minGpa?: number;
  departments?: string[];
  yearsOfStudy?: number[];
}

export type RoleBlueprintStatus = 'draft' | 'published' | 'archived';

export interface RoleBlueprintProps {
  id: EntityId;
  title: string;
  organizationId: string;
  roleFamily: string;
  description?: string;
  requirements: RoleRequirement[];
  eligibilityRules: EligibilityRules;
  status: RoleBlueprintStatus;
  version: number;
  publishedAt?: Date;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ROLE_BLUEPRINT_TRANSITIONS: Record<string, string[]> = {
  draft: ['published', 'archived'],
  published: ['archived'],
  archived: [],
};

export class RoleBlueprint extends AggregateRoot<EntityId> {
  readonly title: string;
  readonly organizationId: string;
  readonly roleFamily: string;
  readonly description?: string;
  readonly orgId: string;
  private _requirements: RoleRequirement[];
  private _eligibilityRules: EligibilityRules;
  private _status: RoleBlueprintStatus;
  private _publishedAt?: Date;

  constructor(props: RoleBlueprintProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.title = props.title;
    this.organizationId = props.organizationId;
    this.roleFamily = props.roleFamily;
    this.description = props.description;
    this.orgId = props.orgId;
    this._requirements = [...props.requirements];
    this._eligibilityRules = { ...props.eligibilityRules };
    this._status = props.status;
    this._publishedAt = props.publishedAt;
  }

  get requirements(): ReadonlyArray<RoleRequirement> {
    return this._requirements;
  }

  get eligibilityRules(): EligibilityRules {
    return this._eligibilityRules;
  }

  get status(): RoleBlueprintStatus {
    return this._status;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  publish(): Result<void> {
    if (!ROLE_BLUEPRINT_TRANSITIONS[this._status]?.includes('published')) {
      return err(new InvariantError(`Cannot publish role blueprint from status: ${this._status}`));
    }
    this._status = 'published';
    this._publishedAt = new Date();
    this.updatedAt = new Date();
    this.version += 1;
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'RoleBlueprintPublished',
        aggregateId: this.id.toString(),
        aggregateType: 'RoleBlueprint',
        payload: {
          blueprintId: this.id.toString(),
          title: this.title,
          organizationId: this.organizationId,
          roleFamily: this.roleFamily,
          publishedAt: this._publishedAt.toISOString(),
        },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  archive(): Result<void> {
    if (!ROLE_BLUEPRINT_TRANSITIONS[this._status]?.includes('archived')) {
      return err(new InvariantError(`Cannot archive role blueprint from status: ${this._status}`));
    }
    this._status = 'archived';
    this.updatedAt = new Date();
    this.version += 1;
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'RoleBlueprintArchived',
        aggregateId: this.id.toString(),
        aggregateType: 'RoleBlueprint',
        payload: {
          blueprintId: this.id.toString(),
          title: this.title,
          organizationId: this.organizationId,
        },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addRequirement(requirement: RoleRequirement): Result<void> {
    if (this._status !== 'draft') {
      return err(new InvariantError('Can only add requirements to draft blueprints'));
    }
    if (requirement.targetLevel < 0 || requirement.targetLevel > 100) {
      return err(new ValidationError('Target level must be between 0 and 100'));
    }
    if (requirement.weight < 0 || requirement.weight > 1) {
      return err(new ValidationError('Weight must be between 0 and 1'));
    }
    const exists = this._requirements.find((r) => r.competencyId === requirement.competencyId);
    if (exists) {
      return err(new InvariantError(`Requirement for competency '${requirement.competencyId}' already exists`));
    }
    this._requirements = [...this._requirements, requirement];
    this.updatedAt = new Date();
    this.version += 1;
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'RoleRequirementAdded',
        aggregateId: this.id.toString(),
        aggregateType: 'RoleBlueprint',
        payload: {
          blueprintId: this.id.toString(),
          competencyId: requirement.competencyId,
          competencyName: requirement.competencyName,
          targetLevel: requirement.targetLevel,
          importance: requirement.importance,
        },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  removeRequirement(competencyId: string): Result<void> {
    if (this._status !== 'draft') {
      return err(new InvariantError('Can only remove requirements from draft blueprints'));
    }
    const exists = this._requirements.find((r) => r.competencyId === competencyId);
    if (!exists) {
      return err(new InvariantError(`Requirement for competency '${competencyId}' not found`));
    }
    this._requirements = this._requirements.filter((r) => r.competencyId !== competencyId);
    this.updatedAt = new Date();
    this.version += 1;
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'RoleRequirementRemoved',
        aggregateId: this.id.toString(),
        aggregateType: 'RoleBlueprint',
        payload: {
          blueprintId: this.id.toString(),
          competencyId,
        },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  updateEligibilityRules(rules: Partial<EligibilityRules>): Result<void> {
    if (this._status !== 'draft') {
      return err(new InvariantError('Can only update eligibility rules on draft blueprints'));
    }
    this._eligibilityRules = { ...this._eligibilityRules, ...rules };
    this.updatedAt = new Date();
    this.version += 1;
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'RoleBlueprintEligibilityUpdated',
        aggregateId: this.id.toString(),
        aggregateType: 'RoleBlueprint',
        payload: {
          blueprintId: this.id.toString(),
          eligibilityRules: this._eligibilityRules,
        },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  isPublished(): boolean {
    return this._status === 'published';
  }

  isDraft(): boolean {
    return this._status === 'draft';
  }

  isArchived(): boolean {
    return this._status === 'archived';
  }
}
