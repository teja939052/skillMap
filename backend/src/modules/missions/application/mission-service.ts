import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, NotFoundError } from '../../../shared/domain/result.js';
import { SkillMission } from '../domain/mission.js';
import { SkillMissionRepository } from '../infrastructure/repositories.js';
import { MISSION_STEP_TYPES } from '../domain/mission.js';

export interface GenerateMissionInput {
  competencyId: string;
  competencyName: string;
  gap: number;
  importance: string;
}

export class SkillMissionService {
  constructor(private readonly repo: SkillMissionRepository) {}

  async getMissionsForStudent(studentId: string): Promise<Result<SkillMission[]>> {
    const missions = await this.repo.findByStudent(studentId);
    return ok(missions);
  }

  async generateMissions(
    studentId: string,
    gaps: Array<{ competencyId: string; competencyName?: string; gap: number; importance: string }>,
    orgId: string
  ): Promise<Result<SkillMission[]>> {
    const existing = await this.repo.findByStudent(studentId);
    const existingMap = new Map(existing.map((m) => [m.competencyId, m]));

    const generated: SkillMission[] = [];

    for (const gap of gaps) {
      const existingMission = existingMap.get(gap.competencyId);
      if (existingMission && existingMission.status === 'completed') continue;

      const steps = Object.entries(MISSION_STEP_TYPES).map(([key, cfg]) => ({
        id: `${gap.competencyId}-${key}`,
        title: cfg.title,
        description: cfg.description,
        type: cfg.type as any,
        order: key === 'learn' ? 0 : key === 'practice' ? 1 : key === 'assess' ? 2 : key === 'project' ? 3 : 4,
        evidenceRequired: key === 'verify',
        estimatedMinutes: cfg.estimatedMinutes,
      }));

      const mission = existingMission || new SkillMission({
        id: EntityId.create(),
        studentId,
        competencyId: gap.competencyId,
        competencyName: gap.competencyName || gap.competencyId,
        title: `Master ${gap.competencyName || gap.competencyId}`,
        description: `Close the gap of ${gap.gap} points and reach the target level.`,
        steps,
        status: 'active' as any,
        currentStep: 0,
        targetLevel: 100,
        orgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      generated.push(mission);
    }

    for (const m of generated) {
      await this.repo.save(m);
    }

    return ok(generated);
  }

  async advanceMission(studentId: string, competencyId: string): Promise<Result<SkillMission>> {
    const mission = await this.repo.findByStudentAndCompetency(studentId, competencyId);
    if (!mission) return err(new NotFoundError('SkillMission', `${studentId}:${competencyId}`));
    const result = mission.advance();
    if (!result.success) return result;
    await this.repo.save(mission);
    return ok(mission);
  }

  async seedDemoData(studentId: string, orgId: string): Promise<Result<SkillMission[]>> {
    const demoGaps = [
      { competencyId: 'aws', competencyName: 'AWS', gap: 43, importance: 'must_have' },
      { competencyId: 'docker', competencyName: 'Docker', gap: 25, importance: 'nice_to_have' },
    ];

    const result = await this.generateMissions(studentId, demoGaps, orgId);
    return result;
  }
}
