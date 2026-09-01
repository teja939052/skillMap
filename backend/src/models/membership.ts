import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import type { Membership } from '../types/index.js';

export function membershipsCollection() {
  return getCollection<Membership>('memberships');
}

export const MembershipModel = {
  async findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null> {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(organizationId)) return null;
    return membershipsCollection().findOne({
      userId: new ObjectId(userId),
      organizationId: new ObjectId(organizationId),
      deletedAt: null,
    });
  },

  async findByUser(userId: string): Promise<Membership[]> {
    if (!ObjectId.isValid(userId)) return [];
    return membershipsCollection()
      .find({ userId: new ObjectId(userId), deletedAt: null })
      .toArray();
  },

  async findByOrg(organizationId: string): Promise<Membership[]> {
    if (!ObjectId.isValid(organizationId)) return [];
    return membershipsCollection()
      .find({ organizationId: new ObjectId(organizationId), deletedAt: null })
      .toArray();
  },

  async countByOrg(organizationId: string): Promise<number> {
    if (!ObjectId.isValid(organizationId)) return 0;
    return membershipsCollection().countDocuments({
      organizationId: new ObjectId(organizationId),
      deletedAt: null,
    });
  },

  async create(data: {
    userId: string;
    organizationId: string;
    role: Membership['role'];
    department?: string;
  }): Promise<Membership> {
    const now = new Date();
    const membership: Membership = {
      _id: new ObjectId(),
      userId: new ObjectId(data.userId),
      organizationId: new ObjectId(data.organizationId),
      role: data.role,
      department: data.department ?? null,
      joinedAt: now,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await membershipsCollection().insertOne(membership);
    return membership;
  },

  async updateRole(membershipId: string, role: Membership['role']): Promise<Membership | null> {
    if (!ObjectId.isValid(membershipId)) return null;
    const result = await membershipsCollection().findOneAndUpdate(
      { _id: new ObjectId(membershipId), deletedAt: null },
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  },

  async softDelete(membershipId: string): Promise<boolean> {
    if (!ObjectId.isValid(membershipId)) return false;
    const result = await membershipsCollection().updateOne(
      { _id: new ObjectId(membershipId), deletedAt: null },
      { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },
};
