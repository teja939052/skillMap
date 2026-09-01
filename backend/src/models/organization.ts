import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import type { Organization } from '../types/index.js';

export function organizationsCollection() {
  return getCollection<Organization>('organizations');
}

export const OrganizationModel = {
  async findById(id: string): Promise<Organization | null> {
    if (!ObjectId.isValid(id)) return null;
    return organizationsCollection().findOne({ _id: new ObjectId(id), deletedAt: null });
  },

  async findBySlug(slug: string): Promise<Organization | null> {
    return organizationsCollection().findOne({ slug, deletedAt: null });
  },

  async create(data: {
    name: string;
    slug: string;
    type: Organization['type'];
    description?: string;
    website?: string;
    logo?: string;
    location?: string;
    industry?: string;
    size?: string;
  }): Promise<Organization> {
    const now = new Date();
    const org: Organization = {
      _id: new ObjectId(),
      name: data.name,
      slug: data.slug,
      type: data.type,
      description: data.description ?? null,
      website: data.website ?? null,
      logo: data.logo ?? null,
      location: data.location ?? null,
      industry: data.industry ?? null,
      size: data.size ?? null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await organizationsCollection().insertOne(org);
    return org;
  },

  async update(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    if (!ObjectId.isValid(id)) return null;
    const result = await organizationsCollection().findOneAndUpdate(
      { _id: new ObjectId(id), deletedAt: null },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  },

  async softDelete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await organizationsCollection().updateOne(
      { _id: new ObjectId(id), deletedAt: null },
      { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async findAll(
    page: number,
    limit: number,
    sort: string,
    order: 'asc' | 'desc',
    filter: Partial<{ type: string }> = {}
  ): Promise<{ items: Organization[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: null };
    if (filter.type) query.type = filter.type;
    const total = await organizationsCollection().countDocuments(query);
    const items = await organizationsCollection()
      .find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    return { items, total };
  },
};
