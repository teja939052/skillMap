import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError } from '../../../shared/domain/result.js';

export interface InstitutionReadinessProps {
  id: EntityId;
  institutionId: string;
  departmentId?: string;
  programId?: string;
  cohortId?: string;
  computedAt: Date;
  overallReadiness: number;
  totalStudents: number;
  assessedStudents: number;
  averageProficiency: number;
  competencyCoverage: number;
  topGaps: Array<{
    competencyId: string;
    competencyName: string;
    currentLevel: number;
    targetLevel: number;
    gap: number;
    studentCount: number;
  }>;
  topStrengths: Array<{
    competencyId: string;
    competencyName: string;
    averageLevel: number;
    studentCount: number;
  }>;
  demandAlignment: number;
  calculationVersion: number;
  createdAt: Date;
}

export class InstitutionReadiness extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly departmentId?: string;
  readonly programId?: string;
  readonly cohortId?: string;
  readonly computedAt: Date;
  readonly overallReadiness: number;
  readonly totalStudents: number;
  readonly assessedStudents: number;
  readonly averageProficiency: number;
  readonly competencyCoverage: number;
  readonly topGaps: InstitutionReadinessProps['topGaps'];
  readonly topStrengths: InstitutionReadinessProps['topStrengths'];
  readonly demandAlignment: number;
  readonly calculationVersion: number;

  constructor(props: InstitutionReadinessProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.institutionId = props.institutionId;
    this.departmentId = props.departmentId;
    this.programId = props.programId;
    this.cohortId = props.cohortId;
    this.computedAt = props.computedAt;
    this.overallReadiness = props.overallReadiness;
    this.totalStudents = props.totalStudents;
    this.assessedStudents = props.assessedStudents;
    this.averageProficiency = props.averageProficiency;
    this.competencyCoverage = props.competencyCoverage;
    this.topGaps = props.topGaps;
    this.topStrengths = props.topStrengths;
    this.demandAlignment = props.demandAlignment;
    this.calculationVersion = props.calculationVersion;
  }
}

export interface SkillGapSummaryProps {
  id: EntityId;
  institutionId: string;
  competencyId: string;
  competencyName: string;
  departmentId?: string;
  averageLevel: number;
  targetLevel: number;
  gap: number;
  studentCount: number;
  studentsBelowTarget: number;
  importance: 'must_have' | 'nice_to_have' | 'bonus';
  priority: number;
  computedAt: Date;
  createdAt: Date;
}

export class SkillGapSummary extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly competencyId: string;
  readonly competencyName: string;
  readonly departmentId?: string;
  readonly averageLevel: number;
  readonly targetLevel: number;
  readonly gap: number;
  readonly studentCount: number;
  readonly studentsBelowTarget: number;
  readonly importance: string;
  readonly priority: number;
  readonly computedAt: Date;

  constructor(props: SkillGapSummaryProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.institutionId = props.institutionId;
    this.competencyId = props.competencyId;
    this.competencyName = props.competencyName;
    this.departmentId = props.departmentId;
    this.averageLevel = props.averageLevel;
    this.targetLevel = props.targetLevel;
    this.gap = props.gap;
    this.studentCount = props.studentCount;
    this.studentsBelowTarget = props.studentsBelowTarget;
    this.importance = props.importance;
    this.priority = props.priority;
    this.computedAt = props.computedAt;
  }
}

export interface InterventionOutcomeSummaryProps {
  id: EntityId;
  interventionId: string;
  interventionName: string;
  institutionId: string;
  competencyId: string;
  competencyName: string;
  totalEnrollments: number;
  completions: number;
  averageBeforeLevel: number;
  averageAfterLevel: number;
  averageImprovement: number;
  successRate: number;
  measuredAt: Date;
  createdAt: Date;
}

export class InterventionOutcomeSummary extends AggregateRoot<EntityId> {
  readonly interventionId: string;
  readonly interventionName: string;
  readonly institutionId: string;
  readonly competencyId: string;
  readonly competencyName: string;
  readonly totalEnrollments: number;
  readonly completions: number;
  readonly averageBeforeLevel: number;
  readonly averageAfterLevel: number;
  readonly averageImprovement: number;
  readonly successRate: number;
  readonly measuredAt: Date;

  constructor(props: InterventionOutcomeSummaryProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.interventionId = props.interventionId;
    this.interventionName = props.interventionName;
    this.institutionId = props.institutionId;
    this.competencyId = props.competencyId;
    this.competencyName = props.competencyName;
    this.totalEnrollments = props.totalEnrollments;
    this.completions = props.completions;
    this.averageBeforeLevel = props.averageBeforeLevel;
    this.averageAfterLevel = props.averageAfterLevel;
    this.averageImprovement = props.averageImprovement;
    this.successRate = props.successRate;
    this.measuredAt = props.measuredAt;
  }
}

export interface IndustryDemandSignalProps {
  id: EntityId;
  competencyId: string;
  competencyName: string;
  region?: string;
  totalOpportunities: number;
  uniqueEmployers: number;
  averageRequiredLevel: number;
  growthRate: number;
  periodStart: Date;
  periodEnd: Date;
  computedAt: Date;
  createdAt: Date;
}

export class IndustryDemandSignal extends AggregateRoot<EntityId> {
  readonly competencyId: string;
  readonly competencyName: string;
  readonly region?: string;
  readonly totalOpportunities: number;
  readonly uniqueEmployers: number;
  readonly averageRequiredLevel: number;
  readonly growthRate: number;
  readonly periodStart: Date;
  readonly periodEnd: Date;
  readonly computedAt: Date;

  constructor(props: IndustryDemandSignalProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.competencyId = props.competencyId;
    this.competencyName = props.competencyName;
    this.region = props.region;
    this.totalOpportunities = props.totalOpportunities;
    this.uniqueEmployers = props.uniqueEmployers;
    this.averageRequiredLevel = props.averageRequiredLevel;
    this.growthRate = props.growthRate;
    this.periodStart = props.periodStart;
    this.periodEnd = props.periodEnd;
    this.computedAt = props.computedAt;
  }
}

export interface PlacementFunnelProps {
  id: EntityId;
  institutionId: string;
  departmentId?: string;
  programId?: string;
  cohortId?: string;
  periodStart: Date;
  periodEnd: Date;
  totalStudents: number;
  applicationsSubmitted: number;
  shortlisted: number;
  interviews: number;
  offersReceived: number;
  offersAccepted: number;
  placementRate: number;
  computedAt: Date;
  createdAt: Date;
}

export class PlacementFunnel extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly departmentId?: string;
  readonly programId?: string;
  readonly cohortId?: string;
  readonly periodStart: Date;
  readonly periodEnd: Date;
  readonly totalStudents: number;
  readonly applicationsSubmitted: number;
  readonly shortlisted: number;
  readonly interviews: number;
  readonly offersReceived: number;
  readonly offersAccepted: number;
  readonly placementRate: number;
  readonly computedAt: Date;

  constructor(props: PlacementFunnelProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.institutionId = props.institutionId;
    this.departmentId = props.departmentId;
    this.programId = props.programId;
    this.cohortId = props.cohortId;
    this.periodStart = props.periodStart;
    this.periodEnd = props.periodEnd;
    this.totalStudents = props.totalStudents;
    this.applicationsSubmitted = props.applicationsSubmitted;
    this.shortlisted = props.shortlisted;
    this.interviews = props.interviews;
    this.offersReceived = props.offersReceived;
    this.offersAccepted = props.offersAccepted;
    this.placementRate = props.placementRate;
    this.computedAt = props.computedAt;
  }
}
