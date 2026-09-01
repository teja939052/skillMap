import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import type { Competency } from '../types/index.js';

export function competenciesCollection() {
  return getCollection<Competency>('competencies');
}

export const CompetencyModel = {
  async findById(id: string): Promise<Competency | null> {
    if (!ObjectId.isValid(id)) return null;
    return competenciesCollection().findOne({ _id: new ObjectId(id), deletedAt: null });
  },

  async findBySlug(slug: string): Promise<Competency | null> {
    return competenciesCollection().findOne({ slug, deletedAt: null });
  },

  async findChildren(parentId: string): Promise<Competency[]> {
    if (!ObjectId.isValid(parentId)) return [];
    return competenciesCollection()
      .find({ parentId: new ObjectId(parentId), deletedAt: null })
      .toArray();
  },

  async findRoots(): Promise<Competency[]> {
    return competenciesCollection().find({ parentId: null, deletedAt: null }).toArray();
  },

  async create(data: {
    name: string;
    slug: string;
    type: Competency['type'];
    parentId?: string;
    description?: string;
    domain?: string;
    keywords?: string[];
  }): Promise<Competency> {
    const now = new Date();
    const competency: Competency = {
      _id: new ObjectId(),
      name: data.name,
      slug: data.slug,
      type: data.type,
      parentId: data.parentId ? new ObjectId(data.parentId) : null,
      description: data.description ?? null,
      domain: data.domain ?? null,
      keywords: data.keywords ?? [],
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await competenciesCollection().insertOne(competency);
    return competency;
  },

  async update(id: string, updates: Partial<Competency>): Promise<Competency | null> {
    if (!ObjectId.isValid(id)) return null;
    const result = await competenciesCollection().findOneAndUpdate(
      { _id: new ObjectId(id), deletedAt: null },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  },

  async softDelete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await competenciesCollection().updateOne(
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
    filter: Partial<{ type: string; domain: string }> = {}
  ): Promise<{ items: Competency[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: null };
    if (filter.type) query.type = filter.type;
    if (filter.domain) query.domain = filter.domain;
    const total = await competenciesCollection().countDocuments(query);
    const items = await competenciesCollection()
      .find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    return { items, total };
  },

  async getTree(): Promise<any[]> {
    const all = await competenciesCollection().find({ deletedAt: null }).toArray();
    const map = new Map<string, any>();

    for (const c of all) {
      map.set(c._id.toString(), { ...c, children: [] });
    }

    const roots: any[] = [];

    for (const c of all) {
      const node = map.get(c._id.toString())!;
      if (c.parentId) {
        const parent = map.get(c.parentId.toString());
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  },
};
