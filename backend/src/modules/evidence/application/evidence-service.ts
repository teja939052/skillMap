import { ObjectId } from 'mongodb';
import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, ValidationError, NotFoundError, ConflictError } from '../../../shared/domain/result.js';
import { Evidence } from '../domain/evidence.js';
import { EvidenceRepository } from '../infrastructure/repositories.js';
import { getCollection } from '../../../config/database.js';

export interface CreateEvidenceData {
  ownerId: string;
  competencyId: string;
  type: 'assessment' | 'project' | 'faculty_verification' | 'industry_verification' | 'self_declaration';
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
  metadata?: Record<string, unknown>;
  sourceId?: string;
  source: string;
  orgId: string;
}

export interface VerifyEvidenceData {
  notes?: string;
}

export interface ListEvidenceFilters {
  competencyId?: string;
  type?: string;
  verificationStatus?: string;
  ownerId?: string;
  orgId?: string;
}

export class EvidenceService {
  constructor(private readonly evidenceRepo: EvidenceRepository) {}

  async create(data: CreateEvidenceData, userId: string): Promise<Result<Evidence>> {
    if (!data.title || !data.title.trim()) {
      return err(new ValidationError('Evidence title is required'));
    }
    if (!data.competencyId) {
      return err(new ValidationError('Competency ID is required'));
    }
    if (data.proficiencyLevel < 0 || data.proficiencyLevel > 100) {
      return err(new ValidationError('Proficiency level must be between 0 and 100'));
    }
    if (data.confidence < 0 || data.confidence > 1) {
      return err(new ValidationError('Confidence must be between 0 and 1'));
    }
    if (!data.source) {
      return err(new ValidationError('Source is required'));
    }

    const evidence = new Evidence({
      id: EntityId.create(),
      ownerId: data.ownerId,
      competencyId: data.competencyId,
      type: data.type,
      title: data.title.trim(),
      description: data.description,
      proficiencyLevel: data.proficiencyLevel,
      score: data.score,
      confidence: data.confidence,
      artifactUrl: data.artifactUrl,
      credentialId: data.credentialId,
      issuer: data.issuer,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt,
      verificationStatus: 'pending',
      metadata: data.metadata ?? {},
      provenance: {
        source: data.source,
        sourceId: data.sourceId,
        importedAt: new Date(),
      },
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.evidenceRepo.save(evidence);
    return ok(evidence);
  }

  async getById(id: string): Promise<Result<Evidence>> {
    const evidence = await this.evidenceRepo.findEvidenceById(id);
    if (!evidence) {
      return err(new NotFoundError('Evidence', id));
    }
    return ok(evidence);
  }

  async list(filters: ListEvidenceFilters): Promise<Result<Evidence[]>> {
    const evidences = await this.evidenceRepo.findEvidences(filters as any);
    return ok(evidences);
  }

  async listByOwner(ownerId: string, competencyId?: string): Promise<Result<Evidence[]>> {
    const filter: Record<string, unknown> = { ownerId, deletedAt: null };
    if (competencyId) {
      filter.competencyId = competencyId;
    }
    const evidences = await this.evidenceRepo.findEvidences(filter);
    return ok(evidences);
  }

  async verify(id: string, verifierId: string, data: VerifyEvidenceData): Promise<Result<Evidence>> {
    const evidence = await this.evidenceRepo.findEvidenceById(id);
    if (!evidence) {
      return err(new NotFoundError('Evidence', id));
    }

    const result = evidence.verify(verifierId, data.notes);
    if (!result.success) {
      return result;
    }

    await this.evidenceRepo.save(evidence);
    return ok(evidence);
  }

  async reject(id: string, verifierId: string, data: VerifyEvidenceData): Promise<Result<Evidence>> {
    const evidence = await this.evidenceRepo.findEvidenceById(id);
    if (!evidence) {
      return err(new NotFoundError('Evidence', id));
    }

    const result = evidence.reject(verifierId, data.notes);
    if (!result.success) {
      return result;
    }

    await this.evidenceRepo.save(evidence);
    return ok(evidence);
  }

  async getStats(ownerId: string): Promise<Result<{
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    byCompetency: Record<string, number>;
  }>> {
    const collection = getCollection('evidence_items');
    const evidences = await collection.find({ ownerId: new ObjectId(ownerId), deletedAt: null }).toArray();

    const stats = {
      total: evidences.length,
      pending: 0,
      verified: 0,
      rejected: 0,
      byCompetency: {} as Record<string, number>,
    };

    for (const e of evidences) {
      if (e.verificationStatus === 'pending') stats.pending++;
      else if (e.verificationStatus === 'verified') stats.verified++;
      else if (e.verificationStatus === 'rejected') stats.rejected++;
      stats.byCompetency[e.competencyId] = (stats.byCompetency[e.competencyId] || 0) + 1;
    }

    return ok(stats);
  }
}
