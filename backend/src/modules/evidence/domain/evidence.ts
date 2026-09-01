import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';
import { EvidenceType, VerificationStatus } from '../../../shared/domain/value-objects.js';

export interface EvidenceProps {
  id: EntityId;
  ownerId: string;
  competencyId: string;
  type: EvidenceType;
  title: string;
  description?: string;
  proficiencyLevel: number;
  score?: number;
  confidence: number;
  artifactUrl?: string;
  credentialId?: string;
  issuer?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
  metadata: Record<string, unknown>;
  provenance: {
    source: string;
    sourceId?: string;
    importedAt: Date;
    rawDataHash?: string;
  };
  orgId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Evidence extends AggregateRoot<EntityId> {
  readonly ownerId: string;
  readonly competencyId: string;
  readonly type: EvidenceType;
  readonly title: string;
  readonly description?: string;
  readonly proficiencyLevel: number;
  readonly score?: number;
  readonly confidence: number;
  readonly artifactUrl?: string;
  readonly credentialId?: string;
  readonly issuer?: string;
  readonly issuedAt?: Date;
  readonly expiresAt?: string;
  private _verificationStatus: VerificationStatus;
  private _verifiedBy?: string;
  private _verifiedAt?: Date;

  get verifiedBy(): string | undefined {
    return this._verifiedBy;
  }

  get verifiedAt(): Date | undefined {
    return this._verifiedAt;
  }
  readonly verificationNotes?: string;
  readonly metadata: Record<string, unknown>;
  readonly provenance: EvidenceProps['provenance'];
  readonly orgId?: string;

  constructor(props: EvidenceProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.ownerId = props.ownerId;
    this.competencyId = props.competencyId;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.proficiencyLevel = props.proficiencyLevel;
    this.score = props.score;
    this.confidence = props.confidence;
    this.artifactUrl = props.artifactUrl;
    this.credentialId = props.credentialId;
    this.issuer = props.issuer;
    this.issuedAt = props.issuedAt;
    this.expiresAt = props.expiresAt as any;
    this._verificationStatus = props.verificationStatus;
    this._verifiedBy = props.verifiedBy;
    this._verifiedAt = props.verifiedAt;
    this.verificationNotes = props.verificationNotes;
    this.metadata = props.metadata;
    this.provenance = props.provenance;
    this.orgId = props.orgId;
  }

  get verificationStatus(): VerificationStatus {
    return this._verificationStatus;
  }

  verify(verifierId: string, notes?: string): Result<void> {
    if (this._verificationStatus === 'verified') {
      return err(new InvariantError('Evidence is already verified'));
    }
    if (this._verificationStatus === 'expired') {
      return err(new InvariantError('Cannot verify expired evidence'));
    }
    this._verificationStatus = 'verified';
    this._verifiedBy = verifierId;
    this._verifiedAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'EvidenceVerified',
        aggregateId: this.id.toString(),
        aggregateType: 'Evidence',
        payload: {
          evidenceId: this.id.toString(),
          ownerId: this.ownerId,
          competencyId: this.competencyId,
          verifierId,
          proficiencyLevel: this.proficiencyLevel,
          confidence: this.confidence,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  reject(verifierId: string, notes?: string): Result<void> {
    if (this._verificationStatus === 'rejected') {
      return err(new InvariantError('Evidence is already rejected'));
    }
    this._verificationStatus = 'rejected';
    this._verifiedBy = verifierId;
    this._verifiedAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'EvidenceRejected',
        aggregateId: this.id.toString(),
        aggregateType: 'Evidence',
        payload: {
          evidenceId: this.id.toString(),
          ownerId: this.ownerId,
          competencyId: this.competencyId,
          verifierId,
          notes,
        },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }

  isVerifiable(): boolean {
    return this._verificationStatus === 'pending' && !this.isExpired();
  }
}
