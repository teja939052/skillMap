import { EntityId } from '../../../shared/domain/entity.js';

export interface EvidencePoint {
  id: string;
  competencyId: string;
  type: string;
  title: string;
  proficiencyLevel: number;
  confidence: number;
  verificationStatus: string;
  verifiedAt?: Date;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export interface CompetencySnapshot {
  competencyId: string;
  proficiency: number;
  confidence: number;
  evidenceCount: number;
  lastAssessedAt?: Date;
}

export interface SkillTwinInput {
  studentId: string;
  evidence: EvidencePoint[];
  competencies: CompetencySnapshot[];
}
