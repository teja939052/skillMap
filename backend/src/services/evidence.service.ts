import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import type { PaginatedResult, Evidence } from '../types/index.js';

export const EvidenceService = {
  async create(data: { ownerId: string; competencyId: string; type: string; title: string; description?: string; proficiencyLevel: number; score?: number; artifactUrl?: string; credentialId?: string; issuer?: string; issuedAt?: Date; expiresAt?: Date; metadata?: Record<string, unknown> }) {
    const collection = getCollection<Evidence>('evidence');
    const now = new Date();

    const evidence: Evidence = {
      _id: new ObjectId(),
      ownerId: new ObjectId(data.ownerId),
      competencyId: new ObjectId(data.competencyId),
      type: data.type as Evidence['type'],
      title: data.title,
      description: data.description || null,
      proficiencyLevel: data.proficiencyLevel,
      score: data.score || null,
      artifactUrl: data.artifactUrl || null,
      credentialId: data.credentialId || null,
      issuer: data.issuer || null,
      issuedAt: data.issuedAt || null,
      expiresAt: data.expiresAt || null,
      metadata: data.metadata || {},
      verificationStatus: 'pending',
      verifiedBy: null,
      verifiedAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(evidence);
    return {
      id: evidence._id.toString(),
      title: evidence.title,
      type: evidence.type,
      proficiencyLevel: evidence.proficiencyLevel,
      verificationStatus: evidence.verificationStatus,
    };
  },

  async listByUser(userId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const collection = getCollection<Evidence>('evidence');
    const filter = { ownerId: new ObjectId(userId), deletedAt: null };
    const total = await collection.countDocuments(filter);
    const items = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      items: items.map(mapEvidence),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async listByCompetency(competencyId: string, status?: string) {
    const collection = getCollection<Evidence>('evidence');
    const filter: Record<string, unknown> = { competencyId: new ObjectId(competencyId), deletedAt: null };
    if (status) filter.verificationStatus = status;

    const items = await collection.find(filter).sort({ createdAt: -1 }).toArray();
    return items.map(mapEvidence);
  },

  async verify(evidenceId: string, verifierId: string, status: 'verified' | 'rejected', notes?: string) {
    const collection = getCollection<Evidence>('evidence');
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(evidenceId), deletedAt: null },
      {
        $set: {
          verificationStatus: status,
          verifiedBy: new ObjectId(verifierId),
          verifiedAt: new Date(),
          updatedAt: new Date(),
          'metadata.notes': notes || null,
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new AppError('Evidence not found', 404);
    }

    return mapEvidence(result);
  },

  async getStats(userId: string) {
    const collection = getCollection<Evidence>('evidence');
    const items = await collection.find({ ownerId: new ObjectId(userId), deletedAt: null }).toArray();

    const stats = {
      total: items.length,
      verified: items.filter((e) => e.verificationStatus === 'verified').length,
      pending: items.filter((e) => e.verificationStatus === 'pending').length,
      byType: {} as Record<string, number>,
      avgProficiency: 0,
    };

    let totalProf = 0;
    for (const item of items) {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      totalProf += item.proficiencyLevel;
    }
    stats.avgProficiency = items.length > 0 ? Math.round((totalProf / items.length) * 10) / 10 : 0;

    return stats;
  },
};

function mapEvidence(e: Evidence) {
  return {
    id: e._id.toString(),
    ownerId: e.ownerId.toString(),
    competencyId: e.competencyId.toString(),
    type: e.type,
    title: e.title,
    description: e.description,
    proficiencyLevel: e.proficiencyLevel,
    score: e.score,
    artifactUrl: e.artifactUrl,
    credentialId: e.credentialId,
    issuer: e.issuer,
    verificationStatus: e.verificationStatus,
    verifiedBy: e.verifiedBy?.toString(),
    verifiedAt: e.verifiedAt,
    createdAt: e.createdAt,
  };
}
