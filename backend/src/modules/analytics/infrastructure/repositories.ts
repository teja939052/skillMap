import { ObjectId } from 'mongodb';
import { Repository } from '../../../shared/persistence/repository.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface InstitutionReadinessDocument {
  _id: ObjectId;
  orgId: string;
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
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class InstitutionReadinessRepository extends Repository<InstitutionReadinessDocument> {
  protected collectionName = 'institution_readiness';
  protected softDelete = false;

  async findLatestByInstitution(institutionId: string): Promise<InstitutionReadinessDocument | null> {
    const docs = await this.findPublic({ institutionId }, { sort: { computedAt: -1 }, limit: 1 } as any);
    return docs[0] || null;
  }

  async findByDepartment(institutionId: string, departmentId: string): Promise<InstitutionReadinessDocument | null> {
    const docs = await this.findPublic({ institutionId, departmentId }, { sort: { computedAt: -1 }, limit: 1 } as any);
    return docs[0] || null;
  }

  async save(doc: InstitutionReadinessDocument): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(doc._id.toString()) },
      { $set: doc },
      { upsert: true }
    );
  }
}

export interface SkillGapSummaryDocument {
  _id: ObjectId;
  orgId: string;
  institutionId: string;
  competencyId: string;
  competencyName: string;
  departmentId?: string;
  averageLevel: number;
  targetLevel: number;
  gap: number;
  studentCount: number;
  studentsBelowTarget: number;
  importance: string;
  priority: number;
  computedAt: Date;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class SkillGapSummaryRepository extends Repository<SkillGapSummaryDocument> {
  protected collectionName = 'skill_gap_summaries';
  protected softDelete = false;

  async findByInstitution(institutionId: string, limit = 20): Promise<SkillGapSummaryDocument[]> {
    return this.findPublic({ institutionId }, { sort: { priority: -1 }, limit } as any);
  }

  async findByDepartment(institutionId: string, departmentId: string): Promise<SkillGapSummaryDocument[]> {
    return this.findPublic({ institutionId, departmentId }, { sort: { priority: -1 } } as any);
  }

  async bulkSave(docs: SkillGapSummaryDocument[]): Promise<void> {
    if (docs.length === 0) return;
    const ops = docs.map((d) => ({
      updateOne: {
        filter: { institutionId: d.institutionId, competencyId: d.competencyId },
        update: { $set: d },
        upsert: true,
      },
    }));
    await this.collection.bulkWrite(ops as any);
  }
}

export interface InterventionOutcomeDocument {
  _id: ObjectId;
  orgId: string;
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
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class InterventionOutcomeRepository extends Repository<InterventionOutcomeDocument> {
  protected collectionName = 'intervention_outcomes';
  protected softDelete = false;

  async findByIntervention(interventionId: string): Promise<InterventionOutcomeDocument[]> {
    return this.findPublic({ interventionId });
  }

  async findByInstitution(institutionId: string): Promise<InterventionOutcomeDocument[]> {
    return this.findPublic({ institutionId }, { sort: { measuredAt: -1 } } as any);
  }

  async save(doc: InterventionOutcomeDocument): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(doc._id.toString()) },
      { $set: doc },
      { upsert: true }
    );
  }
}

export interface IndustryDemandDocument {
  _id: ObjectId;
  orgId?: string;
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
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class IndustryDemandRepository extends Repository<IndustryDemandDocument> {
  protected collectionName = 'industry_demand';
  protected softDelete = false;

  async findTopDemand(limit = 20, region?: string): Promise<IndustryDemandDocument[]> {
    const filter: any = {};
    if (region) filter.region = region;
    return this.findPublic(filter, { sort: { totalOpportunities: -1 }, limit } as any);
  }

  async findByCompetency(competencyId: string): Promise<IndustryDemandDocument | null> {
    return this.findOnePublic({ competencyId });
  }

  async bulkSave(docs: IndustryDemandDocument[]): Promise<void> {
    if (docs.length === 0) return;
    const ops = docs.map((d) => ({
      updateOne: {
        filter: { competencyId: d.competencyId, periodStart: d.periodStart },
        update: { $set: d },
        upsert: true,
      },
    }));
    await this.collection.bulkWrite(ops as any);
  }
}

export interface PlacementFunnelDocument {
  _id: ObjectId;
  orgId: string;
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
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class PlacementFunnelRepository extends Repository<PlacementFunnelDocument> {
  protected collectionName = 'placement_funnel';
  protected softDelete = false;

  async findByInstitution(institutionId: string, periodStart?: Date, periodEnd?: Date): Promise<PlacementFunnelDocument[]> {
    const filter: any = { institutionId };
    if (periodStart) filter.periodStart = { $gte: periodStart };
    if (periodEnd) filter.periodEnd = { $lte: periodEnd };
    return this.findPublic(filter, { sort: { periodStart: -1 } } as any);
  }

  async save(doc: PlacementFunnelDocument): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(doc._id.toString()) },
      { $set: doc },
      { upsert: true }
    );
  }
}
