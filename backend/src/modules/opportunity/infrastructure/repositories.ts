import { Repository } from '../../../shared/persistence/repository.js';
import { Opportunity } from '../domain/opportunity.js';
import { Application } from '../domain/application.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface OpportunityDocument {
  _id: string;
  title: string;
  description: string;
  type: string;
  organizationId: string;
  requirements: Array<{
    competencyId: string;
    targetLevel: number;
    importance: string;
    weight: number;
  }>;
  eligibility: Record<string, unknown>;
  compensation?: { min?: number; max?: number; currency: string; period: string };
  deadline?: Date;
  startDate?: Date;
  duration?: string;
  positions: number;
  status: string;
  createdBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  updatedBy?: string;
  deletedAt?: Date | null;
}

export class OpportunityRepository extends Repository<OpportunityDocument> {
  protected collectionName = 'opportunities';

  async findEntityById(id: string): Promise<Opportunity | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findOpportunityById(id: string): Promise<Opportunity | null> {
    return this.findEntityById(id);
  }

  async findByOrg(organizationId: string): Promise<Opportunity[]> {
    const docs = await this.find({ organizationId, status: 'open' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findOpportunities(filter: any): Promise<Opportunity[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(opportunity: Opportunity): Promise<void> {
    const doc = this.toDocument(opportunity);
    await this.collection.updateOne(
      { _id: opportunity.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: OpportunityDocument): Opportunity {
    return new Opportunity({
      id: EntityId.fromString(doc._id.toString()),
      title: doc.title,
      description: doc.description,
      type: doc.type as any,
      organizationId: doc.organizationId,
      requirements: doc.requirements as any,
      eligibility: doc.eligibility,
      compensation: doc.compensation,
      deadline: doc.deadline,
      startDate: doc.startDate,
      duration: doc.duration,
      positions: doc.positions,
      status: doc.status,
      createdBy: doc.createdBy,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(o: Opportunity): OpportunityDocument {
    return {
      _id: o.id.toString(),
      title: o.title,
      description: o.description,
      type: o.type,
      organizationId: o.organizationId,
      requirements: o.requirements,
      eligibility: o.eligibility,
      compensation: o.compensation,
      deadline: o.deadline,
      startDate: o.startDate,
      duration: o.duration,
      positions: o.positions,
      status: o.status,
      createdBy: o.createdBy,
      orgId: o.orgId,
      version: o.version,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      deletedAt: null,
    };
  }
}

export interface ApplicationDocument {
  _id: string;
  opportunityId: string;
  applicantId: string;
  status: string;
  coverLetter?: string;
  answers: Array<{ question: string; answer: string }>;
  matchScore?: number;
  matchExplanation?: Record<string, unknown>;
  notes?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

export class ApplicationRepository extends Repository<ApplicationDocument> {
  protected collectionName = 'applications';

  async findByOpportunity(opportunityId: string): Promise<Application[]> {
    const docs = await this.find({ opportunityId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByApplicant(applicantId: string): Promise<Application[]> {
    const docs = await this.find({ applicantId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(application: Application): Promise<void> {
    const doc = this.toDocument(application);
    await this.collection.updateOne(
      { _id: application.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: ApplicationDocument): Application {
    return new Application({
      id: EntityId.fromString(doc._id.toString()),
      opportunityId: doc.opportunityId,
      applicantId: doc.applicantId,
      status: doc.status,
      coverLetter: doc.coverLetter,
      answers: doc.answers,
      matchScore: doc.matchScore,
      matchExplanation: doc.matchExplanation as any,
      notes: doc.notes,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(a: Application): ApplicationDocument {
    return {
      _id: a.id.toString(),
      opportunityId: a.opportunityId,
      applicantId: a.applicantId,
      status: a.status,
      coverLetter: a.coverLetter,
      answers: a.answers,
      matchScore: a.matchScore,
      matchExplanation: a.matchExplanation as any,
      orgId: a.orgId,
      version: a.version,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: null,
    };
  }
}
