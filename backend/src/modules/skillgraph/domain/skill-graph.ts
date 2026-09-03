import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError, ValidationError } from '../../../shared/domain/result.js';

export interface SkillGraphNodeProps {
  id: EntityId;
  competencyId: string;
  name: string;
  type: string;
  parentIds: string[];
  childIds: string[];
  targetRoleIds: string[];
  domain: string;
  difficulty: number;
  estimatedHours: number;
  prerequisites: string[];
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SkillGraphNode extends AggregateRoot<EntityId> {
  readonly competencyId: string;
  readonly name: string;
  readonly type: string;
  private _parentIds: string[];
  private _childIds: string[];
  private _targetRoleIds: string[];
  readonly domain: string;
  readonly difficulty: number;
  readonly estimatedHours: number;
  readonly prerequisites: string[];
  readonly orgId: string;

  constructor(props: SkillGraphNodeProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.competencyId = props.competencyId;
    this.name = props.name;
    this.type = props.type;
    this._parentIds = [...props.parentIds];
    this._childIds = [...props.childIds];
    this._targetRoleIds = [...props.targetRoleIds];
    this.domain = props.domain;
    this.difficulty = props.difficulty;
    this.estimatedHours = props.estimatedHours;
    this.prerequisites = [...props.prerequisites];
    this.orgId = props.orgId;
  }

  get parentIds(): string[] { return this._parentIds; }
  get childIds(): string[] { return this._childIds; }
  get targetRoleIds(): string[] { return this._targetRoleIds; }

  addChild(childId: string): Result<void> {
    if (this._childIds.includes(childId)) return ok(undefined);
    this._childIds = [...this._childIds, childId];
    this.updatedAt = new Date();
    return ok(undefined);
  }

  addTargetRole(roleId: string): Result<void> {
    if (this._targetRoleIds.includes(roleId)) return ok(undefined);
    this._targetRoleIds = [...this._targetRoleIds, roleId];
    this.updatedAt = new Date();
    return ok(undefined);
  }
}

export interface SkillGraphEdge {
  source: string;
  target: string;
  relation: 'prerequisite' | 'related' | 'alternative';
}

export interface SkillGraphRole {
  id: string;
  title: string;
  description?: string;
  requiredSkills: string[];
  preferredSkills: string[];
}
