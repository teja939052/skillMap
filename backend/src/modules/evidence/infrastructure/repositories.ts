import { Repository } from '../../../shared/persistence/repository.js';
import { Evidence } from '../domain/evidence.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface EvidenceDocument {
  _id: string;
  ownerId: string;
  competencyId: string;
  type: string;
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
  verificationStatus: string;
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
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class EvidenceRepository extends Repository<EvidenceDocument> {
  protected collectionName = 'evidence_items';

  async findEntityById(id: string): Promise<Evidence | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findEvidenceById(id: string): Promise<Evidence | null> {
    return this.findEntityById(id);
  }

  async findByOwner(ownerId: string): Promise<Evidence[]> {
    const docs = await this.find({ ownerId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCompetency(competencyId: string): Promise<Evidence[]> {
    const docs = await this.find({ competencyId, verificationStatus: 'verified' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findEvidences(filter: any): Promise<Evidence[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(evidence: Evidence): Promise<void> {
    const doc = this.toDocument(evidence);
    await this.collection.updateOne(
      { _id: evidence.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: EvidenceDocument): Evidence {
    return new Evidence({
      id: EntityId.fromString(doc._id.toString()),
      ownerId: doc.ownerId,
      competencyId: doc.competencyId,
      type: doc.type as any,
      title: doc.title,
      description: doc.description,
      proficiencyLevel: doc.proficiencyLevel,
      score: doc.score,
      confidence: doc.confidence,
      artifactUrl: doc.artifactUrl,
      credentialId: doc.credentialId,
      issuer: doc.issuer,
      issuedAt: doc.issuedAt,
      expiresAt: doc.expiresAt as any,
      verificationStatus: doc.verificationStatus as any,
      verifiedBy: doc.verifiedBy,
      verifiedAt: doc.verifiedAt,
      verificationNotes: doc.verificationNotes,
      metadata: doc.metadata,
      provenance: doc.provenance,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(e: Evidence): EvidenceDocument {
    return {
      _id: e.id.toString(),
      ownerId: e.ownerId,
      competencyId: e.competencyId,
      type: e.type,
      title: e.title,
      description: e.description,
      proficiencyLevel: e.proficiencyLevel,
      score: e.score,
      confidence: e.confidence,
      artifactUrl: e.artifactUrl,
      credentialId: e.credentialId,
      issuer: e.issuer,
      issuedAt: e.issuedAt,
      expiresAt: e.expiresAt as any,
      verificationStatus: e.verificationStatus,
      verifiedBy: e.verifiedBy,
      verifiedAt: e.verifiedAt,
      verificationNotes: e.verificationNotes,
      metadata: e.metadata,
      provenance: e.provenance,
      orgId: e.orgId,
      version: e.version,
      status: e.verificationStatus,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deletedAt: null,
    };
  }
}
