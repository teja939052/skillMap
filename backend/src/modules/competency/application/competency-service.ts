import { ObjectId } from 'mongodb';
import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, ValidationError, NotFoundError } from '../../../shared/domain/result.js';
import { StudentCompetency } from '../../competency/domain/competency.js';
import {
  StudentCompetencyRepository,
} from '../../competency/infrastructure/repositories.js';
import { EvidenceService } from '../../evidence/application/evidence-service.js';
import { Evidence } from '../../evidence/domain/evidence.js';

export interface CompetencyProficiencyInput {
  competencyId: string;
  proficiency: number;
  confidence: number;
  evidenceCount: number;
}

export class StudentCompetencyService {
  constructor(
    private readonly competencyRepo: StudentCompetencyRepository,
    private readonly evidenceService: EvidenceService
  ) {}

  async getStudentCompetencies(studentId: string): Promise<Result<StudentCompetency[]>> {
    const competencies = await this.competencyRepo.findByStudent(studentId);
    return ok(competencies);
  }

  async getCompetencyDetail(studentId: string, competencyId: string): Promise<Result<StudentCompetency | null>> {
    const competency = await this.competencyRepo.findByStudentAndCompetency(studentId, competencyId);
    return ok(competency);
  }

  async recalculateFromEvidence(studentId: string): Promise<Result<StudentCompetency[]>> {
    const evidenceResult = await this.evidenceService.listByOwner(studentId);
    if (!evidenceResult.success) {
      return evidenceResult;
    }

    const verifiedEvidence = evidenceResult.value.filter(
      (e) => e.verificationStatus === 'verified'
    );

    const competencyMap = new Map<string, {
      proficiencySum: number;
      confidenceSum: number;
      count: number;
      competencyId: string;
    }>();

    for (const evidence of verifiedEvidence) {
      const existing = competencyMap.get(evidence.competencyId);
      if (existing) {
        existing.proficiencySum += evidence.proficiencyLevel;
        existing.confidenceSum += evidence.confidence;
        existing.count += 1;
      } else {
        competencyMap.set(evidence.competencyId, {
          proficiencySum: evidence.proficiencyLevel,
          confidenceSum: evidence.confidence,
          count: 1,
          competencyId: evidence.competencyId,
        });
      }
    }

    const updatedCompetencies: StudentCompetency[] = [];
    const calculationVersion = Date.now();

    for (const [, data] of competencyMap) {
      const avgProficiency = Math.round(data.proficiencySum / data.count);
      const avgConfidence = data.confidenceSum / data.count;

      let studentComp = await this.competencyRepo.findByStudentAndCompetency(
        studentId,
        data.competencyId
      );

      if (studentComp) {
        const updateResult = studentComp.updateProficiency(
          avgProficiency,
          avgConfidence,
          data.count,
          calculationVersion
        );
        if (!updateResult.success) {
          return updateResult;
        }
      } else {
        studentComp = new StudentCompetency({
          id: EntityId.create(),
          studentId,
          competencyId: data.competencyId,
          proficiency: avgProficiency,
          confidence: avgConfidence,
          evidenceCount: data.count,
          lastAssessedAt: new Date(),
          calculationVersion,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await this.competencyRepo.save(studentComp);
      updatedCompetencies.push(studentComp);
    }

    return ok(updatedCompetencies);
  }

  async recalculateSingleCompetency(studentId: string, competencyId: string): Promise<Result<StudentCompetency>> {
    const evidenceResult = await this.evidenceService.listByOwner(studentId);
    if (!evidenceResult.success) {
      return evidenceResult;
    }

    const competencyEvidence = evidenceResult.value.filter(
      (e) => e.competencyId === competencyId && e.verificationStatus === 'verified'
    );

    if (competencyEvidence.length === 0) {
      return err(new NotFoundError('Competency', competencyId));
    }

    const proficiencySum = competencyEvidence.reduce((s, e) => s + e.proficiencyLevel, 0);
    const confidenceSum = competencyEvidence.reduce((s, e) => s + e.confidence, 0);
    const avgProficiency = Math.round(proficiencySum / competencyEvidence.length);
    const avgConfidence = confidenceSum / competencyEvidence.length;
    const calculationVersion = Date.now();

    let studentComp = await this.competencyRepo.findByStudentAndCompetency(studentId, competencyId);

    if (studentComp) {
      const updateResult = studentComp.updateProficiency(
        avgProficiency,
        avgConfidence,
        competencyEvidence.length,
        calculationVersion
      );
      if (!updateResult.success) {
        return updateResult;
      }
    } else {
      studentComp = new StudentCompetency({
        id: EntityId.create(),
        studentId,
        competencyId,
        proficiency: avgProficiency,
        confidence: avgConfidence,
        evidenceCount: competencyEvidence.length,
        lastAssessedAt: new Date(),
        calculationVersion,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await this.competencyRepo.save(studentComp);
    return ok(studentComp);
  }

  async getSkillGaps(
    studentId: string,
    requirements: Array<{ competencyId: string; targetLevel: number; weight: number; importance: string }>
  ): Promise<Result<Array<{
    competencyId: string;
    currentLevel: number;
    targetLevel: number;
    gap: number;
    importance: string;
    priority: number;
  }>>> {
    const competencies = await this.competencyRepo.findByStudent(studentId);
    const competencyMap = new Map(
      competencies.map((c) => [c.competencyId, c])
    );

    const gaps = requirements
      .map((req) => {
        const studentComp = competencyMap.get(req.competencyId);
        const currentLevel = studentComp?.proficiency ?? 0;
        const gap = Math.max(0, req.targetLevel - currentLevel);
        const importanceWeight = req.importance === 'must_have' ? 3 : req.importance === 'nice_to_have' ? 1.5 : 0.5;
        const priority = gap * importanceWeight * req.weight;

        return {
          competencyId: req.competencyId,
          currentLevel,
          targetLevel: req.targetLevel,
          gap,
          importance: req.importance,
          priority,
        };
      })
      .filter((g) => g.gap > 0)
      .sort((a, b) => b.priority - a.priority);

    return ok(gaps);
  }
}
