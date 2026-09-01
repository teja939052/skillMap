import { ObjectId } from 'mongodb';
import { UserModel } from '../models/user.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuditService } from './audit.service.js';
import type { PaginatedResult } from '../types/index.js';

export const UserService = {
  async getById(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  },

  async update(userId: string, updates: Record<string, unknown>) {
    const allowedFields = ['name', 'avatar', 'bio', 'phone', 'location'];
    const filtered: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        filtered[key] = updates[key];
      }
    }

    const user = await UserModel.update(userId, filtered);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await AuditService.log({
      userId,
      action: 'user.update',
      resource: 'users',
      resourceId: userId,
    });

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      updatedAt: user.updatedAt,
    };
  },

  async updateStudentProfile(userId: string, profile: Record<string, unknown>) {
    const user = await UserModel.updateStudentProfile(userId, profile as any);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.studentProfile;
  },

  async getCompetencyPassport(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const evidenceCollection = getCollection('evidence');
    const evidence = await evidenceCollection
      .find({ ownerId: new ObjectId(userId), verificationStatus: 'verified', deletedAt: null })
      .toArray();

    const competencyIds = [...new Set(evidence.map((e) => e.competencyId.toString()))];
    const competencyCollection = getCollection('competencies');
    const competencies = await competencyCollection
      .find({ _id: { $in: competencyIds.map((id) => new ObjectId(id)) } })
      .toArray();

    const passport = competencyIds.map((compId) => {
      const comp = competencies.find((c) => c._id.toString() === compId);
      const compEvidence = evidence.filter((e) => e.competencyId.toString() === compId);
      const latestLevel = Math.max(...compEvidence.map((e) => e.proficiencyLevel));
      const avgConfidence = compEvidence.reduce((sum, e) => sum + (e.metadata.confidence as number || 0.5), 0) / compEvidence.length;

      return {
        competencyId: compId,
        name: comp?.name || 'Unknown',
        level: latestLevel,
        confidence: Math.round(avgConfidence * 100) / 100,
        evidenceCount: compEvidence.length,
        lastUpdated: compEvidence.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt,
      };
    });

    return passport;
  },

  async getGaps(userId: string, roleBlueprintId?: string) {
    const passport = await UserService.getCompetencyPassport(userId);
    const passportMap = new Map(passport.map((p) => [p.competencyId, p]));

    if (!roleBlueprintId) {
      return [];
    }

    const blueprintCollection = getCollection('roleBlueprints');
    const blueprint = await blueprintCollection.findOne({
      _id: new ObjectId(roleBlueprintId),
      deletedAt: null,
    });

    if (!blueprint) {
      throw new AppError('Role blueprint not found', 404);
    }

    const gaps = blueprint.requirements
      .map((req: any) => {
        const userComp = passportMap.get(req.competencyId.toString());
        const currentLevel = userComp?.level || 0;
        const gap = req.level - currentLevel;

        return {
          competencyId: req.competencyId.toString(),
          requiredLevel: req.level,
          currentLevel,
          gap: Math.max(0, gap),
          weight: req.weight,
          priority: gap * req.weight,
        };
      })
      .filter((g: any) => g.gap > 0)
      .sort((a: any, b: any) => b.priority - a.priority);

    return gaps;
  },

  async list(page: number, limit: number, sort: string, order: 'asc' | 'desc'): Promise<PaginatedResult<any>> {
    const { items, total } = await UserModel.findAll(page, limit, sort, order);
    return {
      items: items.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },
};

import { getCollection } from '../config/database.js';
