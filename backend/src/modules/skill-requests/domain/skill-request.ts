import { EntityId } from '../../../shared/domain/entity.js';

export interface SkillRequestRequirement {
  competencyId: string;
  minLevel: number;
  requestedCount: number;
}

export interface IndustrySkillRequestProps {
  id: EntityId;
  title: string;
  description: string;
  companyName: string;
  postedBy: string;
  orgId: string;
  requirements: SkillRequestRequirement[];
  projectDurationDays: number;
  status: 'open' | 'fulfilled' | 'in_action' | 'closed';
  supply?: number;
  shortfall?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class IndustrySkillRequest {
  readonly id: EntityId;
  readonly title: string;
  readonly description: string;
  readonly companyName: string;
  readonly postedBy: string;
  readonly orgId: string;
  readonly requirements: SkillRequestRequirement[];
  readonly projectDurationDays: number;
  status: string;
  supply?: number;
  shortfall?: number;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: IndustrySkillRequestProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.companyName = props.companyName;
    this.postedBy = props.postedBy;
    this.orgId = props.orgId;
    this.requirements = props.requirements;
    this.projectDurationDays = props.projectDurationDays;
    this.status = props.status;
    this.supply = props.supply;
    this.shortfall = props.shortfall;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
