import { EntityId } from '../../../shared/domain/entity.js';

export interface MicroInternshipRequirement {
  competencyId: string;
  minLevel: number;
  weight: number;
}

export interface MicroInternshipProps {
  id: EntityId;
  title: string;
  description: string;
  companyName: string;
  postedBy: string;
  orgId: string;
  requiredSkills: MicroInternshipRequirement[];
  durationDays: number;
  stipend?: number;
  currency: string;
  positions: number;
  status: 'open' | 'matched' | 'in_progress' | 'evaluating' | 'completed' | 'cancelled';
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MicroInternshipApplicationProps {
  id: EntityId;
  internshipId: string;
  studentId: string;
  message: string;
  status: 'applied' | 'selected' | 'rejected' | 'started' | 'completed';
  evaluationScore?: number;
  evaluationFeedback?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MicroInternship {
  readonly id: EntityId;
  readonly title: string;
  readonly description: string;
  readonly companyName: string;
  readonly postedBy: string;
  readonly orgId: string;
  readonly requiredSkills: MicroInternshipRequirement[];
  readonly durationDays: number;
  readonly stipend?: number;
  readonly currency: string;
  readonly positions: number;
  status: string;
  readonly deadline?: Date;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: MicroInternshipProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.companyName = props.companyName;
    this.postedBy = props.postedBy;
    this.orgId = props.orgId;
    this.requiredSkills = props.requiredSkills;
    this.durationDays = props.durationDays;
    this.stipend = props.stipend;
    this.currency = props.currency;
    this.positions = props.positions;
    this.status = props.status;
    this.deadline = props.deadline;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOpen(): boolean {
    if (this.status !== 'open') return false;
    if (this.deadline && new Date(this.deadline) < new Date()) return false;
    return true;
  }
}

export class MicroInternshipApplication {
  readonly id: EntityId;
  readonly internshipId: string;
  readonly studentId: string;
  readonly message: string;
  status: string;
  readonly evaluationScore?: number;
  readonly evaluationFeedback?: string;
  readonly orgId: string;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: MicroInternshipApplicationProps) {
    this.id = props.id;
    this.internshipId = props.internshipId;
    this.studentId = props.studentId;
    this.message = props.message;
    this.status = props.status;
    this.evaluationScore = props.evaluationScore;
    this.evaluationFeedback = props.evaluationFeedback;
    this.orgId = props.orgId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
