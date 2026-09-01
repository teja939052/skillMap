import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { slugify } from '@skill-map/utils';
import type { PaginatedResult, Competency, RoleBlueprint } from '../types/index.js';

export const CompetencyService = {
  async create(data: { name: string; type: string; parentId?: string; description?: string; domain?: string; keywords?: string[] }) {
    const slug = slugify(data.name);
    const collection = getCollection<Competency>('competencies');

    const existing = await collection.findOne({ slug, deletedAt: null });
    if (existing) {
      throw new AppError('Competency with this name already exists', 409);
    }

    const now = new Date();
    const competency: Competency = {
      _id: new ObjectId(),
      name: data.name,
      slug,
      type: data.type as Competency['type'],
      parentId: data.parentId ? new ObjectId(data.parentId) : null,
      description: data.description || null,
      domain: data.domain || null,
      keywords: data.keywords || [],
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(competency);

    if (data.parentId) {
      await collection.updateOne(
        { _id: new ObjectId(data.parentId) },
        { $addToSet: { children: competency._id } }
      );
    }

    return {
      id: competency._id.toString(),
      name: competency.name,
      slug: competency.slug,
      type: competency.type,
      domain: competency.domain,
    };
  },

  async getTree() {
    const collection = getCollection<Competency>('competencies');
    const competencies = await collection.find({ deletedAt: null }).toArray();

    const roots = competencies.filter((c) => !c.parentId);
    const buildTree = (node: Competency): any => ({
      id: node._id.toString(),
      name: node.name,
      slug: node.slug,
      type: node.type,
      domain: node.domain,
      children: competencies
        .filter((c) => c.parentId?.toString() === node._id.toString())
        .map(buildTree),
    });

    return roots.map(buildTree);
  },

  async list(page: number, limit: number, domain?: string, type?: string): Promise<PaginatedResult<any>> {
    const collection = getCollection<Competency>('competencies');
    const filter: Record<string, unknown> = { deletedAt: null };
    if (domain) filter.domain = domain;
    if (type) filter.type = type;

    const total = await collection.countDocuments(filter);
    const items = await collection
      .find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      items: items.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        type: c.type,
        domain: c.domain,
        keywords: c.keywords,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async createRoleBlueprint(data: { title: string; organizationId?: string; roleFamily?: string; description?: string; requirements: Array<{ competencyId: string; level: number; weight: number; evidenceRule?: string; freshness?: number }> }) {
    const collection = getCollection<RoleBlueprint>('roleBlueprints');
    const now = new Date();

    const blueprint: RoleBlueprint = {
      _id: new ObjectId(),
      title: data.title,
      organizationId: data.organizationId ? new ObjectId(data.organizationId) : null,
      roleFamily: data.roleFamily || null,
      description: data.description || null,
      requirements: data.requirements.map((r) => ({
        competencyId: new ObjectId(r.competencyId),
        level: r.level,
        weight: r.weight,
        evidenceRule: r.evidenceRule || null,
        freshness: r.freshness || 180,
      })),
      isActive: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(blueprint);

    return {
      id: blueprint._id.toString(),
      title: blueprint.title,
      roleFamily: blueprint.roleFamily,
      requirementsCount: blueprint.requirements.length,
    };
  },

  async listRoleBlueprints(orgId?: string) {
    const collection = getCollection<RoleBlueprint>('roleBlueprints');
    const filter: Record<string, unknown> = { deletedAt: null, isActive: true };
    if (orgId) filter.organizationId = new ObjectId(orgId);

    const items = await collection.find(filter).sort({ title: 1 }).toArray();
    return items.map((b) => ({
      id: b._id.toString(),
      title: b.title,
      roleFamily: b.roleFamily,
      requirements: b.requirements.map((r) => ({
        competencyId: r.competencyId.toString(),
        level: r.level,
        weight: r.weight,
      })),
    }));
  },
};
