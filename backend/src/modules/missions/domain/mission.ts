import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';

export interface MissionStepProps {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'assess' | 'project' | 'verify';
  order: number;
  evidenceRequired: boolean;
  estimatedMinutes: number;
}

export interface SkillMissionProps {
  id: EntityId;
  studentId: string;
  competencyId: string;
  competencyName: string;
  title: string;
  description: string;
  steps: MissionStepProps[];
  status: 'active' | 'completed' | 'abandoned';
  currentStep: number;
  targetLevel: number;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SkillMission extends AggregateRoot<EntityId> {
  readonly studentId: string;
  readonly competencyId: string;
  readonly competencyName: string;
  private _title: string;
  private _description: string;
  readonly steps: MissionStepProps[];
  private _status: string;
  private _currentStep: number;
  readonly targetLevel: number;
  readonly orgId: string;

  constructor(props: SkillMissionProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.studentId = props.studentId;
    this.competencyId = props.competencyId;
    this.competencyName = props.competencyName;
    this._title = props.title;
    this._description = props.description;
    this.steps = props.steps;
    this._status = props.status;
    this._currentStep = props.currentStep;
    this.targetLevel = props.targetLevel;
    this.orgId = props.orgId;
  }

  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get status(): string { return this._status; }
  get currentStep(): number { return this._currentStep; }

  advance(): Result<void> {
    if (this._status !== 'active') return err(new InvariantError('Mission is not active'));
    if (this._currentStep >= this.steps.length - 1) {
      this._status = 'completed';
      this.updatedAt = new Date();
      return ok(undefined);
    }
    this._currentStep += 1;
    this.updatedAt = new Date();
    return ok(undefined);
  }
}

export const MISSION_STEP_TYPES: Record<string, { title: string; description: string; type: MissionStepProps['type']; estimatedMinutes: number }> = {
  learn: { title: 'Learn the fundamentals', description: 'Complete guided learning materials and documentation for this skill.', type: 'learn', estimatedMinutes: 120 },
  practice: { title: 'Practice problems', description: 'Solve structured practice problems to build muscle memory.', type: 'practice', estimatedMinutes: 180 },
  assess: { title: 'Take a skill assessment', description: 'Validate your current level with a short assessment.', type: 'assess', estimatedMinutes: 30 },
  project: { title: 'Build a real project', description: 'Apply the skill in a small end-to-end project.', type: 'project', estimatedMinutes: 240 },
  verify: { title: 'Get verification', description: 'Submit evidence for faculty or industry verification.', type: 'verify', estimatedMinutes: 60 },
};
