import { createHash } from 'node:crypto';
import { SkillTwinInput, EvidencePoint, CompetencySnapshot } from '../domain/skill-twin.js';

export interface SkillTwinResolver {
  getEvidence(studentId: string): Promise<EvidencePoint[]>;
  getCompetencies(studentId: string): Promise<CompetencySnapshot[]>;
  getRoleRequirements(roleId?: string): Promise<Array<{ competencyId: string; competencyName: string; targetLevel: number; importance: string }> | null>;
  getShareTarget(input: SkillTwinInput, roleId?: string): Record<string, unknown>;
}

const EVIDENCE_STRENGTH: Record<string, number> = {
  industry_verification: 0.95,
  industry_project: 0.93,
  internship_outcome: 0.9,
  project: 0.88,
  github: 0.85,
  faculty_verification: 0.9,
  mentor_attestation: 0.86,
  challenge: 0.85,
  micro_work: 0.8,
  certification: 0.72,
  assessment: 0.8,
  hackathon: 0.7,
  research: 0.85,
  workshop: 0.6,
  self_declaration: 0.2,
};

const VERIFIED_BOOST = 0.1;

function recencyFactor(createdAt?: Date): number {
  if (!createdAt) return 1;
  const months = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months <= 3) return 1;
  if (months <= 8) return 0.85;
  if (months <= 14) return 0.7;
  return 0.5;
}

export class SkillTwinService {
  constructor(
    private readonly resolver: SkillTwinResolver,
    private readonly defaultRoleResolver?: SkillTwinResolver['getRoleRequirements']
  ) {}

  private async load(studentId: string): Promise<SkillTwinInput> {
    const [evidence, competencies] = await Promise.all([
      this.resolver.getEvidence(studentId),
      this.resolver.getCompetencies(studentId),
    ]);
    return { studentId, evidence, competencies };
  }

  private trustFor(type: string, verified: string, createdAt?: Date): { confidence: number; quality: 'LOW' | 'MEDIUM' | 'HIGH' } {
    const base = EVIDENCE_STRENGTH[type] ?? 0.5;
    const verifierBoost = verified === 'verified' ? VERIFIED_BOOST : 0;
    const recency = recencyFactor(createdAt);
    const value = Math.min(1, (base + verifierBoost) * recency);
    const quality = value >= 0.7 ? 'HIGH' : value >= 0.45 ? 'MEDIUM' : 'LOW';
    return { confidence: Math.round(value * 100), quality };
  }

  private buildTrajectory(evidence: EvidencePoint[]) {
    const bySkill = new Map<string, EvidencePoint[]>();
    for (const e of evidence) {
      const arr = bySkill.get(e.competencyId) || [];
      arr.push(e);
      bySkill.set(e.competencyId, arr);
    }
    const trajectory: Array<{ competencyId: string; points: Array<{ date: Date; level: number; source: string }> }> = [];
    for (const [competencyId, items] of bySkill.entries()) {
      const sorted = items
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      trajectory.push({
        competencyId,
        points: sorted.map((i) => ({
          date: i.createdAt,
          level: i.proficiencyLevel,
          source: i.type,
        })),
      });
    }
    return trajectory;
  }

  private buildEvidenceWallet(evidence: EvidencePoint[]) {
    return evidence
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((e) => {
        const { confidence, quality } = this.trustFor(e.type, e.verificationStatus, e.createdAt);
        return {
          id: e.id,
          competencyId: e.competencyId,
          type: e.type,
          title: e.title,
          proficiencyLevel: e.proficiencyLevel,
          confidence,
          quality,
          verificationStatus: e.verificationStatus,
          verifiedAt: e.verifiedAt,
          createdAt: e.createdAt,
          metadata: e.metadata,
        };
      });
  }

  async getTwin(studentId: string) {
    const input = await this.load(studentId);
    const wallet = this.buildEvidenceWallet(input.evidence);
    const trajectory = this.buildTrajectory(input.evidence);

    const skills = input.competencies.map((c) => {
      const skillWallet = wallet.filter((w) => w.competencyId === c.competencyId);
      const weighted = skillWallet.length
        ? Math.round(skillWallet.reduce((s, w) => s + w.confidence * (w.quality === 'HIGH' ? 1 : w.quality === 'MEDIUM' ? 0.7 : 0.4), 0) / skillWallet.length)
        : c.confidence * 100;
      return {
        competencyId: c.competencyId,
        proficiency: c.proficiency,
        confidence: c.confidence,
        evidenceCount: c.evidenceCount,
        evidenceTrust: Math.min(100, weighted),
        lastAssessedAt: c.lastAssessedAt,
      };
    });

    return {
      studentId,
      skills,
      evidenceWallet: wallet,
      trajectory,
      staleSkills: skills.filter((s) => s.lastAssessedAt && (Date.now() - new Date(s.lastAssessedAt).getTime()) / (1000*60*60*24*30) > 14),
    };
  }

  async getRoleView(studentId: string, roleId?: string, requirementResolver?: SkillTwinResolver['getRoleRequirements']) {
    const input = await this.load(studentId);
    const twin = await this.getTwin(studentId);
    const requirements = requirementResolver || this.defaultRoleResolver ? await (requirementResolver || this.defaultRoleResolver!)(roleId) : null;
    if (!requirements) {
      return { studentId, roleId: roleId || null, requirements: null, skills: twin.skills };
    }
    const reqMap = new Map(requirements.map((r) => [r.competencyId, r]));
    const aligned = twin.skills.map((s) => {
      const req = reqMap.get(s.competencyId);
      return {
        ...s,
        required: req ? req.targetLevel : undefined,
        requiredImportance: req ? req.importance : undefined,
        met: req ? s.proficiency >= req.targetLevel : undefined,
      };
    });
    const metCount = aligned.filter((a) => a.met).length;
    const total = requirements.length;
    const fit = total ? Math.round((metCount / total) * 100) : 0;
    return { studentId, roleId: roleId || null, roleFit: fit, skills: aligned.sort((a, b) => Number(b.required ?? -1) - Number(a.required ?? -1)) };
  }

  async buildPortfolio(studentId: string) {
    const twin = await this.getTwin(studentId);
    const verified = twin.evidenceWallet.filter((w) => w.verificationStatus === 'verified' || w.quality === 'HIGH');
    return {
      studentId,
      shareToken: this.makeShareToken(studentId),
      skills: twin.skills.filter((s) => s.evidenceTrust >= 40),
      verifiedAchievements: verified.map((w) => ({
        type: w.type, title: w.title, competencyId: w.competencyId, level: w.proficiencyLevel, quality: w.quality, date: w.createdAt,
      })),
    };
  }

  private makeShareToken(studentId: string): string {
    const raw = `${studentId}|${Date.now()}`;
    return createHash('sha256').update(raw).digest('hex').slice(0, 24);
  }
}
