import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';
import { CompetencyType, ProficiencyLevel, scoreToBand } from '../../../shared/domain/value-objects.js';

export interface CompetencyProps {
  id: EntityId;
  name: string;
  slug: string;
  type: CompetencyType;
  description?: string;
  domain?: string;
  parentId?: EntityId;
  keywords: string[];
  aliases: string[];
  evidenceTypes: string[];
  status: 'active' | 'deprecated' | 'draft';
  taxonomyVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Competency extends AggregateRoot<EntityId> {
  readonly name: string;
  readonly slug: string;
  readonly type: CompetencyType;
  readonly description?: string;
  readonly domain?: string;
  readonly parentId?: EntityId;
  readonly keywords: string[];
  readonly aliases: string[];
  readonly evidenceTypes: string[];
  private _status: 'active' | 'deprecated' | 'draft';
  readonly taxonomyVersion: number;

  constructor(props: CompetencyProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.slug = props.slug;
    this.type = props.type;
    this.description = props.description;
    this.domain = props.domain;
    this.parentId = props.parentId;
    this.keywords = props.keywords;
    this.aliases = props.aliases;
    this.evidenceTypes = props.evidenceTypes;
    this._status = props.status;
    this.taxonomyVersion = props.taxonomyVersion;
  }

  get status(): string {
    return this._status;
  }

  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  activate(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Competency is already active'));
    }
    this._status = 'active';
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CompetencyActivated',
        aggregateId: this.id.toString(),
        aggregateType: 'Competency',
        payload: { competencyId: this.id.toString(), name: this.name },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  deprecate(): Result<void> {
    if (this._status === 'deprecated') {
      return err(new InvariantError('Competency is already deprecated'));
    }
    this._status = 'deprecated';
    this.updateTimestamp();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CompetencyDeprecated',
        aggregateId: this.id.toString(),
        aggregateType: 'Competency',
        payload: { competencyId: this.id.toString(), name: this.name },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  isAssignable(): boolean {
    return this._status === 'active';
  }
}

export interface StudentCompetencyProps {
  id: EntityId;
  studentId: string;
  competencyId: string;
  proficiency: ProficiencyLevel;
  confidence: number;
  evidenceCount: number;
  lastAssessedAt?: Date;
  calculationVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export class StudentCompetency extends AggregateRoot<EntityId> {
  readonly studentId: string;
  readonly competencyId: string;
  private _proficiency: ProficiencyLevel;
  private _confidence: number;
  private _evidenceCount: number;
  private _lastAssessedAt?: Date;

  get lastAssessedAt(): Date | undefined {
    return this._lastAssessedAt;
  }
  private _calculationVersion: number;

  constructor(props: StudentCompetencyProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.studentId = props.studentId;
    this.competencyId = props.competencyId;
    this._proficiency = props.proficiency;
    this._confidence = props.confidence;
    this._evidenceCount = props.evidenceCount;
    this._lastAssessedAt = props.lastAssessedAt;
    this._calculationVersion = props.calculationVersion;
  }

  get proficiency(): ProficiencyLevel {
    return this._proficiency;
  }

  get confidence(): number {
    return this._confidence;
  }

  get evidenceCount(): number {
    return this._evidenceCount;
  }

  get calculationVersion(): number {
    return this._calculationVersion;
  }

  get band(): string {
    return scoreToBand(this._proficiency);
  }

  updateProficiency(
    proficiency: ProficiencyLevel,
    confidence: number,
    evidenceCount: number,
    calculationVersion: number
  ): Result<void> {
    if (confidence < 0 || confidence > 1) {
      return err(new InvariantError('Confidence must be between 0 and 1'));
    }
    const oldProficiency = this._proficiency;
    this._proficiency = proficiency;
    this._confidence = confidence;
    this._evidenceCount = evidenceCount;
    this._calculationVersion = calculationVersion;
    this._lastAssessedAt = new Date();
    this.updatedAt = new Date();

    if (oldProficiency !== proficiency) {
      this.addDomainEvent(
        createDomainEvent({
          eventType: 'StudentCompetencyUpdated',
          aggregateId: this.id.toString(),
          aggregateType: 'StudentCompetency',
          payload: {
            studentId: this.studentId,
            competencyId: this.competencyId,
            oldProficiency,
            newProficiency: proficiency,
            confidence,
            calculationVersion,
          },
          version: this.version,
        })
      );
    }
    return ok(undefined);
  }
}
