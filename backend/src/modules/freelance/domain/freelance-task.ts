import { EntityId } from '../../../shared/domain/entity.js';

export interface FreelanceTaskProps {
  id: EntityId;
  title: string;
  description: string;
  category: string;
  requiredSkills: Array<{ competencyId: string; minLevel: number; weight: number }>;
  payout: number;
  currency: string;
  estimatedHours: number;
  deadline?: Date;
  postedBy: string;
  orgId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FreelanceTask {
  readonly id: EntityId;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly requiredSkills: FreelanceTaskProps['requiredSkills'];
  readonly payout: number;
  readonly currency: string;
  readonly estimatedHours: number;
  readonly deadline?: Date;
  readonly postedBy: string;
  readonly orgId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: FreelanceTaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.requiredSkills = props.requiredSkills;
    this.payout = props.payout;
    this.currency = props.currency;
    this.estimatedHours = props.estimatedHours;
    this.deadline = props.deadline;
    this.postedBy = props.postedBy;
    this.orgId = props.orgId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOpen(): boolean {
    if (this.status !== 'open') return false;
    if (this.deadline && new Date(this.deadline) < new Date()) return false;
    return true;
  }
}
