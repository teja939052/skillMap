import { Repository } from '../../../shared/persistence/repository.js';
import { SkillMission } from '../domain/mission.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface SkillMissionDocument {
  _id: string;
  studentId: string;
  competencyId: string;
  competencyName: string;
  title: string;
  description: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    order: number;
    evidenceRequired: boolean;
    estimatedMinutes: number;
  }>;
  status: string;
  currentStep: number;
  targetLevel: number;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class SkillMissionRepository extends Repository<SkillMissionDocument> {
  protected collectionName = 'skill_missions';

  async findByStudent(studentId: string): Promise<SkillMission[]> {
    const docs = await this.find({ studentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStudentAndCompetency(studentId: string, competencyId: string): Promise<SkillMission | null> {
    const doc = await this.findOne({ studentId, competencyId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async save(mission: SkillMission): Promise<void> {
    const doc = this.toDocument(mission);
    await this.collection.updateOne(
      { _id: mission.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: SkillMissionDocument): SkillMission {
    return new SkillMission({
      id: EntityId.fromString(doc._id.toString()),
      studentId: doc.studentId,
      competencyId: doc.competencyId,
      competencyName: doc.competencyName,
      title: doc.title,
      description: doc.description,
      steps: doc.steps.map((s) => ({
        ...s,
        type: s.type as 'learn' | 'practice' | 'assess' | 'project' | 'verify',
      })),
      status: doc.status as any,
      currentStep: doc.currentStep,
      targetLevel: doc.targetLevel,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(m: SkillMission): SkillMissionDocument {
    return {
      _id: m.id.toString(),
      studentId: m.studentId,
      competencyId: m.competencyId,
      competencyName: m.competencyName,
      title: m.title,
      description: m.description,
      steps: m.steps,
      status: m.status,
      currentStep: m.currentStep,
      targetLevel: m.targetLevel,
      orgId: m.orgId,
      version: m.version,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: null,
    };
  }
}
