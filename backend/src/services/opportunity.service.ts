import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { MatchingService } from './matching.service.js';
import type { PaginatedResult, Opportunity, Application } from '../types/index.js';

export const OpportunityService = {
  async create(data: { title: string; description: string; type: string; organizationId: string; location?: string; isRemote?: boolean; requirements?: any[]; eligibility?: any; compensation?: any; deadline?: Date; startDate?: Date; duration?: string; positions?: number; createdBy: string }) {
    const collection = getCollection<Opportunity>('opportunities');
    const now = new Date();

    const opportunity: Opportunity = {
      _id: new ObjectId(),
      title: data.title,
      description: data.description,
      type: data.type as Opportunity['type'],
      organizationId: new ObjectId(data.organizationId),
      location: data.location || null,
      isRemote: data.isRemote || false,
      requirements: (data.requirements || []).map((r) => ({
        competencyId: new ObjectId(r.competencyId),
        minLevel: r.minLevel,
        weight: r.weight || 1,
      })),
      eligibility: data.eligibility || null,
      compensation: data.compensation || null,
      deadline: data.deadline || null,
      startDate: data.startDate || null,
      duration: data.duration || null,
      positions: data.positions || 1,
      status: 'draft',
      createdBy: new ObjectId(data.createdBy),
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(opportunity);
    return {
      id: opportunity._id.toString(),
      title: opportunity.title,
      type: opportunity.type,
      status: opportunity.status,
    };
  },

  async list(page: number, limit: number, filters: { type?: string; orgId?: string; status?: string } = {}): Promise<PaginatedResult<any>> {
    const collection = getCollection<Opportunity>('opportunities');
    const filter: Record<string, unknown> = { deletedAt: null };
    if (filters.type) filter.type = filters.type;
    if (filters.orgId) filter.organizationId = new ObjectId(filters.orgId);
    if (filters.status) filter.status = filters.status;
    else filter.status = 'open';

    const total = await collection.countDocuments(filter);
    const items = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      items: items.map(mapOpportunity),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(opportunityId: string) {
    const collection = getCollection<Opportunity>('opportunities');
    const opportunity = await collection.findOne({ _id: new ObjectId(opportunityId), deletedAt: null });
    if (!opportunity) {
      throw new AppError('Opportunity not found', 404);
    }
    return mapOpportunity(opportunity);
  },

  async update(opportunityId: string, updates: Record<string, unknown>) {
    const allowedFields = ['title', 'description', 'status', 'location', 'isRemote', 'requirements', 'eligibility', 'compensation', 'deadline', 'startDate', 'duration', 'positions'];
    const filtered: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) filtered[key] = updates[key];
    }

    const collection = getCollection<Opportunity>('opportunities');
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(opportunityId), deletedAt: null },
      { $set: { ...filtered, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Opportunity not found', 404);
    }
    return mapOpportunity(result);
  },

  async apply(opportunityId: string, applicantId: string, data: { coverLetter?: string; answers?: any[] }) {
    const opportunity = await getCollection<Opportunity>('opportunities').findOne({
      _id: new ObjectId(opportunityId),
      deletedAt: null,
      status: 'open',
    });

    if (!opportunity) {
      throw new AppError('Opportunity not found or not open', 404);
    }

    const applicationCollection = getCollection<Application>('applications');
    const existing = await applicationCollection.findOne({
      opportunityId: new ObjectId(opportunityId),
      applicantId: new ObjectId(applicantId),
    });

    if (existing) {
      throw new AppError('Already applied to this opportunity', 409);
    }

    const matchScore = await MatchingService.calculateScore(applicantId, opportunity.requirements);

    const application: Application = {
      _id: new ObjectId(),
      opportunityId: new ObjectId(opportunityId),
      applicantId: new ObjectId(applicantId),
      status: 'submitted',
      coverLetter: data.coverLetter || null,
      answers: data.answers || [],
      matchScore,
      notes: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await applicationCollection.insertOne(application);
    return {
      id: application._id.toString(),
      status: application.status,
      matchScore,
    };
  },

  async listApplications(opportunityId: string, page: number, limit: number) {
    const collection = getCollection<Application>('applications');
    const filter = { opportunityId: new ObjectId(opportunityId), deletedAt: null };
    const total = await collection.countDocuments(filter);
    const items = await collection
      .find(filter)
      .sort({ matchScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      items: items.map((a) => ({
        id: a._id.toString(),
        applicantId: a.applicantId.toString(),
        status: a.status,
        matchScore: a.matchScore,
        coverLetter: a.coverLetter,
        createdAt: a.createdAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateApplication(applicationId: string, updates: { status: Application['status']; notes?: string }) {
    const collection = getCollection<Application>('applications');
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(applicationId), deletedAt: null },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Application not found', 404);
    }
    return { id: result._id.toString(), status: result.status };
  },
};

function mapOpportunity(o: Opportunity) {
  return {
    id: o._id.toString(),
    title: o.title,
    type: o.type,
    organizationId: o.organizationId.toString(),
    location: o.location,
    isRemote: o.isRemote,
    requirements: o.requirements.map((r) => ({
      competencyId: r.competencyId.toString(),
      minLevel: r.minLevel,
      weight: r.weight,
    })),
    status: o.status,
    deadline: o.deadline,
    startDate: o.startDate,
    duration: o.duration,
    positions: o.positions,
    createdAt: o.createdAt,
  };
}
