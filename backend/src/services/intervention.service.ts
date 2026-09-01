import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { PaginatedResult, Intervention, Outcome } from '../types/index.js';

export const InterventionService = {
  async create(data: { title: string; description: string; type: string; organizationId: string; competencyIds: string[]; instructorId?: string; partnerOrgId?: string; startDate: Date; endDate: Date; capacity?: number; location?: string; isOnline?: boolean; meetingUrl?: string }) {
    const collection = getCollection<Intervention>('interventions');
    const now = new Date();

    const intervention: Intervention = {
      _id: new ObjectId(),
      title: data.title,
      description: data.description,
      type: data.type as Intervention['type'],
      organizationId: new ObjectId(data.organizationId),
      competencyIds: data.competencyIds.map((id) => new ObjectId(id)),
      instructorId: data.instructorId ? new ObjectId(data.instructorId) : null,
      partnerOrgId: data.partnerOrgId ? new ObjectId(data.partnerOrgId) : null,
      startDate: data.startDate,
      endDate: data.endDate,
      capacity: data.capacity || null,
      enrolledUserIds: [],
      location: data.location || null,
      isOnline: data.isOnline || false,
      meetingUrl: data.meetingUrl || null,
      status: 'draft',
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(intervention);
    return { id: intervention._id.toString(), title: intervention.title, status: intervention.status };
  },

  async list(orgId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const collection = getCollection<Intervention>('interventions');
    const filter = { organizationId: new ObjectId(orgId), deletedAt: null };
    const total = await collection.countDocuments(filter);
    const items = await collection.find(filter).sort({ startDate: -1 }).skip((page - 1) * limit).limit(limit).toArray();

    return {
      items: items.map((i) => ({
        id: i._id.toString(),
        title: i.title,
        type: i.type,
        status: i.status,
        startDate: i.startDate,
        endDate: i.endDate,
        enrolledCount: i.enrolledUserIds.length,
        capacity: i.capacity,
      })),
      page, limit, total, totalPages: Math.ceil(total / limit),
    };
  },

  async enroll(interventionId: string, userId: string) {
    const collection = getCollection<Intervention>('interventions');
    const intervention = await collection.findOne({ _id: new ObjectId(interventionId), deletedAt: null });
    if (!intervention) throw new AppError('Intervention not found', 404);
    if (intervention.capacity && intervention.enrolledUserIds.length >= intervention.capacity) {
      throw new AppError('Intervention is full', 400);
    }
    if (intervention.enrolledUserIds.some((id) => id.toString() === userId)) {
      throw new AppError('Already enrolled', 409);
    }

    await collection.updateOne(
      { _id: new ObjectId(interventionId) },
      { $push: { enrolledUserIds: new ObjectId(userId) }, $set: { updatedAt: new Date() } }
    );
    return { enrolled: true };
  },

  async recordOutcome(data: { userId?: string; organizationId?: string; interventionId?: string; competencyId: string; beforeLevel: number; afterLevel: number; beforeConfidence: number; afterConfidence: number }) {
    const collection = getCollection<Outcome>('outcomes');
    const outcome: Outcome = {
      _id: new ObjectId(),
      userId: data.userId ? new ObjectId(data.userId) : null,
      organizationId: data.organizationId ? new ObjectId(data.organizationId) : null,
      interventionId: data.interventionId ? new ObjectId(data.interventionId) : null,
      competencyId: new ObjectId(data.competencyId),
      beforeLevel: data.beforeLevel,
      afterLevel: data.afterLevel,
      beforeConfidence: data.beforeConfidence,
      afterConfidence: data.afterConfidence,
      measuredAt: new Date(),
      createdAt: new Date(),
    };
    await collection.insertOne(outcome);
    return { id: outcome._id.toString(), improvement: data.afterLevel - data.beforeLevel };
  },

  async getOutcomes(orgId: string) {
    const collection = getCollection<Outcome>('outcomes');
    const items = await collection.find({ organizationId: new ObjectId(orgId) }).sort({ measuredAt: -1 }).toArray();
    return items.map((o) => ({
      id: o._id.toString(),
      competencyId: o.competencyId.toString(),
      beforeLevel: o.beforeLevel,
      afterLevel: o.afterLevel,
      improvement: o.afterLevel - o.beforeLevel,
      measuredAt: o.measuredAt,
    }));
  },
};
