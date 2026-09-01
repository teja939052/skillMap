import { ObjectId } from 'mongodb';
import { OrganizationModel } from '../models/organization.js';
import { MembershipModel } from '../models/membership.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuditService } from './audit.service.js';
import { slugify } from '@skill-map/utils';
import type { PaginatedResult } from '../types/index.js';

export const OrganizationService = {
  async create(data: { name: string; type: string; description?: string; website?: string; location?: string; industry?: string; size?: string }, ownerId: string) {
    const slug = slugify(data.name);
    const existing = await OrganizationModel.findBySlug(slug);
    if (existing) {
      throw new AppError('Organization with this name already exists', 409);
    }

    const org = await OrganizationModel.create({
      name: data.name,
      slug,
      type: data.type as 'institution' | 'company',
      description: data.description ?? undefined,
      website: data.website ?? undefined,
      location: data.location ?? undefined,
      industry: data.industry ?? undefined,
      size: data.size ?? undefined,
    });

    await MembershipModel.create({
      userId: ownerId,
      organizationId: org._id.toString(),
      role: 'owner',
    });

    await AuditService.log({
      userId: ownerId,
      action: 'organization.create',
      resource: 'organizations',
      resourceId: org._id.toString(),
    });

    return {
      id: org._id.toString(),
      name: org.name,
      slug: org.slug,
      type: org.type,
    };
  },

  async getById(orgId: string) {
    const org = await OrganizationModel.findById(orgId);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    const memberCount = await MembershipModel.countByOrg(orgId);
    return {
      id: org._id.toString(),
      name: org.name,
      slug: org.slug,
      type: org.type,
      description: org.description,
      website: org.website,
      logo: org.logo,
      location: org.location,
      industry: org.industry,
      size: org.size,
      memberCount,
      createdAt: org.createdAt,
    };
  },

  async update(orgId: string, updates: Record<string, unknown>) {
    const allowedFields = ['name', 'description', 'website', 'logo', 'location', 'industry', 'size'];
    const filtered: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        filtered[key] = updates[key];
      }
    }

    const org = await OrganizationModel.update(orgId, filtered);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return {
      id: org._id.toString(),
      name: org.name,
      slug: org.slug,
      type: org.type,
      description: org.description,
      updatedAt: org.updatedAt,
    };
  },

  async list(page: number, limit: number, type?: string): Promise<PaginatedResult<any>> {
    const { items, total } = await OrganizationModel.findAll(page, limit, 'name', 'asc', { type });
    const mapped = await Promise.all(
      items.map(async (org) => {
        const memberCount = await MembershipModel.countByOrg(org._id.toString());
        return {
          id: org._id.toString(),
          name: org.name,
          slug: org.slug,
          type: org.type,
          memberCount,
          createdAt: org.createdAt,
        };
      })
    );
    return { items: mapped, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async getMembers(orgId: string, page: number, limit: number) {
    const memberships = await MembershipModel.findByOrg(orgId);
    const start = (page - 1) * limit;
    const paginatedItems = memberships.slice(start, start + limit);
    return { items: paginatedItems, total: memberships.length, totalPages: Math.ceil(memberships.length / limit) };
  },

  async inviteMember(orgId: string, invitedBy: string, data: { email: string; role: string; department?: string }) {
    const UserModel = await import('../models/user.js');
    const user = await UserModel.UserModel.findByEmail(data.email);
    if (!user) {
      throw new AppError('User not found. They must register first.', 404);
    }

    const existing = await MembershipModel.findByUserAndOrg(user._id.toString(), orgId);
    if (existing) {
      throw new AppError('User is already a member', 409);
    }

    await MembershipModel.create({
      userId: user._id.toString(),
      organizationId: orgId,
      role: data.role as 'admin' | 'member' | 'viewer',
      department: data.department,
    });

    await AuditService.log({
      userId: invitedBy,
      action: 'organization.invite_member',
      resource: 'organizations',
      resourceId: orgId,
      metadata: { invitedUserId: user._id.toString(), role: data.role },
    });

    return { userId: user._id.toString(), email: user.email, role: data.role };
  },

  async updateMemberRole(orgId: string, userId: string, role: string) {
    const membership = await MembershipModel.findByUserAndOrg(userId, orgId);
    if (!membership) throw new AppError('Membership not found', 404);
    await MembershipModel.updateRole(membership._id.toString(), role as 'admin' | 'member' | 'viewer');
    return { userId, role };
  },

  async removeMember(orgId: string, userId: string) {
    const membership = await MembershipModel.findByUserAndOrg(userId, orgId);
    if (!membership) throw new AppError('Membership not found', 404);
    await MembershipModel.softDelete(membership._id.toString());
    return { removed: true };
  },
};
