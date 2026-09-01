import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import type { AuditLog } from '../types/index.js';

export const AuditService = {
  async log(data: {
    userId: string | null;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const collection = getCollection<AuditLog>('auditLogs');
    await collection.insertOne({
      _id: new ObjectId(),
      userId: data.userId ? new ObjectId(data.userId) : null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      metadata: data.metadata ?? {},
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      createdAt: new Date(),
    });
  },

  async findByOrg(orgId: string, page: number, limit: number) {
    const collection = getCollection<AuditLog>('auditLogs');
    const filter = { resourceId: orgId };
    const total = await collection.countDocuments(filter);
    const items = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    return { items, total };
  },
};
