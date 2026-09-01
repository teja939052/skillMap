import { Evidence } from '../../evidence/domain/evidence.js';
import { StudentCompetency } from '../domain/competency.js';
import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';

export interface EvidenceInput {
  proficiencyLevel: number;
  confidence: number;
  recencyDays: number;
  verificationWeight: number;
  evidenceTypeWeight: number;
}

export interface ScoringContext {
  algorithmVersion: number;
  recencyHalfLifeDays: number;
  verificationBoost: number;
  selfDeclarationPenalty: number;
  minConfidenceThreshold: number;
  maxSingleEvidenceContribution: number;
}

export const DEFAULT_SCORING_CONTEXT: ScoringContext = {
  algorithmVersion: 2,
  recencyHalfLifeDays: 180,
  verificationBoost: 1.5,
  selfDeclarationPenalty: 0.3,
  minConfidenceThreshold: 0.1,
  maxSingleEvidenceContribution: 40,
};

export class CompetencyScoringEngine {
  constructor(private readonly context: ScoringContext = DEFAULT_SCORING_CONTEXT) {}

  calculateProficiency(evidenceInputs: EvidenceInput[]): {
    proficiency: number;
    confidence: number;
    evidenceCount: number;
  } {
    if (evidenceInputs.length === 0) {
      return { proficiency: 0, confidence: 0, evidenceCount: 0 };
    }

    let weightedSum = 0;
    let weightTotal = 0;
    let confidenceSum = 0;

    for (const input of evidenceInputs) {
      const recencyFactor = Math.pow(0.5, input.recencyDays / this.context.recencyHalfLifeDays);
      const weight = input.verificationWeight * input.evidenceTypeWeight * recencyFactor;

      weightedSum += input.proficiencyLevel * weight;
      weightTotal += weight;
      confidenceSum += input.confidence * recencyFactor;
    }

    const proficiency = weightTotal > 0
      ? Math.min(100, Math.round((weightedSum / weightTotal) * 10) / 10)
      : 0;

    const confidence = evidenceInputs.length > 0
      ? Math.min(1, Math.round((confidenceSum / evidenceInputs.length) * 100) / 100)
      : 0;

    return {
      proficiency,
      confidence,
      evidenceCount: evidenceInputs.length,
    };
  }

  aggregateEvidence(evidence: Evidence[]): EvidenceInput[] {
    return evidence
      .filter((e) => e.verificationStatus === 'verified' || e.verificationStatus === 'pending')
      .filter((e) => !e.isExpired())
      .map((e) => {
        const recencyDays = e.issuedAt
          ? Math.floor((Date.now() - new Date(e.issuedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const verificationWeight = this.getVerificationWeight(e.verificationStatus);
        const evidenceTypeWeight = this.getEvidenceTypeWeight(e.type);

        return {
          proficiencyLevel: e.proficiencyLevel,
          confidence: e.confidence,
          recencyDays,
          verificationWeight,
          evidenceTypeWeight,
        };
      });
  }

  recalculateStudentCompetency(
    existing: StudentCompetency | null,
    evidence: Evidence[]
  ): Result<StudentCompetency> {
    const inputs = this.aggregateEvidence(evidence);
    const { proficiency, confidence, evidenceCount } = this.calculateProficiency(inputs);

    if (existing) {
      existing.updateProficiency(proficiency, confidence, evidenceCount, this.context.algorithmVersion);
      return ok(existing);
    }

    if (evidence.length === 0) {
      return err(new InvariantError('Cannot create projection without evidence'));
    }

    const studentId = evidence[0].ownerId;
    const competencyId = evidence[0].competencyId;

    const projection = new StudentCompetency({
      id: EntityId.create(),
      studentId,
      competencyId,
      proficiency,
      confidence,
      evidenceCount,
      calculationVersion: this.context.algorithmVersion,
      lastAssessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return ok(projection);
  }

  private getVerificationWeight(status: string): number {
    switch (status) {
      case 'verified': return this.context.verificationBoost;
      case 'pending': return 0.7;
      default: return 0;
    }
  }

  private getEvidenceTypeWeight(type: string): number {
    switch (type) {
      case 'assessment': return 1.0;
      case 'industry_verification': return 1.0;
      case 'faculty_verification': return 0.9;
      case 'internship_outcome': return 0.9;
      case 'project': return 0.8;
      case 'mentor_attestation': return 0.8;
      case 'certification': return 0.7;
      case 'experience': return 0.6;
      case 'self_declaration': return this.context.selfDeclarationPenalty;
      default: return 0.5;
    }
  }
}
