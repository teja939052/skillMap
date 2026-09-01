import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, NotFoundError, ValidationError, InvariantError } from '../../../shared/domain/result.js';
import {
  RoleBlueprint,
  RoleRequirement,
  EligibilityRules,
} from '../domain/role-blueprint.js';
import { RoleBlueprintRepository } from '../infrastructure/repositories.js';

export interface CreateBlueprintData {
  title: string;
  organizationId: string;
  roleFamily: string;
  description?: string;
  requirements?: RoleRequirement[];
  eligibilityRules?: EligibilityRules;
  orgId: string;
}

export interface UpdateBlueprintData {
  title?: string;
  roleFamily?: string;
  description?: string;
  eligibilityRules?: Partial<EligibilityRules>;
}

export interface ListBlueprintFilters {
  orgId?: string;
  organizationId?: string;
  roleFamily?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface StudentCompetencyInput {
  competencyId: string;
  proficiency: number;
  confidence: number;
}

export interface CompetencyMatchDetail {
  competencyId: string;
  competencyName: string;
  requiredLevel: number;
  actualLevel: number;
  gap: number;
  importance: 'required' | 'preferred' | 'bonus';
  weight: number;
  met: boolean;
  contribution: number;
}

export interface MatchAnalysisResult {
  blueprintId: string;
  blueprintTitle: string;
  overallScore: number;
  maxPossibleScore: number;
  rawScore: number;
  competencyMatches: CompetencyMatchDetail[];
  gaps: CompetencyMatchDetail[];
  strengths: CompetencyMatchDetail[];
  requirementsMet: number;
  requirementsTotal: number;
  eligibilityPassed: boolean;
  calculatedAt: Date;
}

export class RoleBlueprintService {
  constructor(private readonly repository: RoleBlueprintRepository) {}

  async createBlueprint(data: CreateBlueprintData, userId: string): Promise<Result<RoleBlueprint>> {
    if (!data.title || !data.title.trim()) {
      return err(new ValidationError('Blueprint title is required'));
    }
    if (!data.organizationId) {
      return err(new ValidationError('Organization ID is required'));
    }
    if (!data.roleFamily || !data.roleFamily.trim()) {
      return err(new ValidationError('Role family is required'));
    }

    const blueprint = new RoleBlueprint({
      id: EntityId.create(),
      title: data.title.trim(),
      organizationId: data.organizationId,
      roleFamily: data.roleFamily.trim(),
      description: data.description,
      requirements: data.requirements ?? [],
      eligibilityRules: data.eligibilityRules ?? {},
      status: 'draft',
      version: 1,
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    blueprint.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'RoleBlueprintCreated',
      aggregateId: blueprint.id.toString(),
      aggregateType: 'RoleBlueprint',
      occurredAt: new Date(),
      payload: {
        blueprintId: blueprint.id.toString(),
        title: blueprint.title,
        organizationId: blueprint.organizationId,
        roleFamily: blueprint.roleFamily,
      },
      orgId: blueprint.orgId,
      actorId: userId,
      version: 1,
    });

    await this.repository.save(blueprint);
    return ok(blueprint);
  }

  async getById(id: string): Promise<Result<RoleBlueprint>> {
    const blueprint = await this.repository.findEntityById(id);
    if (!blueprint) {
      return err(new NotFoundError('RoleBlueprint', id));
    }
    return ok(blueprint);
  }

  async updateBlueprint(id: string, updates: UpdateBlueprintData, userId: string): Promise<Result<RoleBlueprint>> {
    const blueprint = await this.repository.findEntityById(id);
    if (!blueprint) {
      return err(new NotFoundError('RoleBlueprint', id));
    }

    if (!blueprint.isDraft()) {
      return err(new InvariantError('Can only update draft blueprints'));
    }

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        return err(new ValidationError('Blueprint title cannot be empty'));
      }
      (blueprint as any).title = updates.title.trim();
    }
    if (updates.roleFamily !== undefined) {
      (blueprint as any).roleFamily = updates.roleFamily.trim();
    }
    if (updates.description !== undefined) {
      (blueprint as any).description = updates.description;
    }
    if (updates.eligibilityRules !== undefined) {
      const result = blueprint.updateEligibilityRules(updates.eligibilityRules);
      if (!result.success) {
        return result;
      }
    }

    (blueprint as any).updatedAt = new Date();
    (blueprint as any).version += 1;

    blueprint.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'RoleBlueprintUpdated',
      aggregateId: blueprint.id.toString(),
      aggregateType: 'RoleBlueprint',
      occurredAt: new Date(),
      payload: {
        blueprintId: blueprint.id.toString(),
        updates,
      },
      orgId: blueprint.orgId,
      actorId: userId,
      version: blueprint.version,
    });

    await this.repository.save(blueprint);
    return ok(blueprint);
  }

  async publishBlueprint(id: string, userId: string): Promise<Result<RoleBlueprint>> {
    const blueprint = await this.repository.findEntityById(id);
    if (!blueprint) {
      return err(new NotFoundError('RoleBlueprint', id));
    }

    const result = blueprint.publish();
    if (!result.success) {
      return result;
    }

    blueprint.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'RoleBlueprintPublished',
      aggregateId: blueprint.id.toString(),
      aggregateType: 'RoleBlueprint',
      occurredAt: new Date(),
      payload: {
        blueprintId: blueprint.id.toString(),
        title: blueprint.title,
        publishedAt: blueprint.publishedAt,
      },
      orgId: blueprint.orgId,
      actorId: userId,
      version: blueprint.version,
    });

    await this.repository.save(blueprint);
    return ok(blueprint);
  }

  async archiveBlueprint(id: string, userId: string): Promise<Result<RoleBlueprint>> {
    const blueprint = await this.repository.findEntityById(id);
    if (!blueprint) {
      return err(new NotFoundError('RoleBlueprint', id));
    }

    const result = blueprint.archive();
    if (!result.success) {
      return result;
    }

    blueprint.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'RoleBlueprintArchived',
      aggregateId: blueprint.id.toString(),
      aggregateType: 'RoleBlueprint',
      occurredAt: new Date(),
      payload: {
        blueprintId: blueprint.id.toString(),
        title: blueprint.title,
      },
      orgId: blueprint.orgId,
      actorId: userId,
      version: blueprint.version,
    });

    await this.repository.save(blueprint);
    return ok(blueprint);
  }

  async listBlueprints(filters: ListBlueprintFilters): Promise<Result<RoleBlueprint[]>> {
    const query: Record<string, unknown> = {};
    if (filters.orgId) query.orgId = filters.orgId;
    if (filters.organizationId) query.organizationId = filters.organizationId;
    if (filters.roleFamily) query.roleFamily = filters.roleFamily;
    if (filters.status) query.status = filters.status;

    const blueprints = await this.repository.findBlueprints(query as any);
    return ok(blueprints);
  }

  async addRequirement(blueprintId: string, requirement: RoleRequirement, userId: string): Promise<Result<RoleBlueprint>> {
    const blueprint = await this.repository.findEntityById(blueprintId);
    if (!blueprint) {
      return err(new NotFoundError('RoleBlueprint', blueprintId));
    }

    const result = blueprint.addRequirement(requirement);
    if (!result.success) {
      return result;
    }

    blueprint.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'RoleRequirementAdded',
      aggregateId: blueprint.id.toString(),
      aggregateType: 'RoleBlueprint',
      occurredAt: new Date(),
      payload: {
        blueprintId: blueprint.id.toString(),
        competencyId: requirement.competencyId,
        competencyName: requirement.competencyName,
        targetLevel: requirement.targetLevel,
        importance: requirement.importance,
      },
      orgId: blueprint.orgId,
      actorId: userId,
      version: blueprint.version,
    });

    await this.repository.save(blueprint);
    return ok(blueprint);
  }

  async removeRequirement(blueprintId: string, competencyId: string, userId: string): Promise<Result<RoleBlueprint>> {
    const blueprint = await this.repository.findEntityById(blueprintId);
    if (!blueprint) {
      return err(new NotFoundError('RoleBlueprint', blueprintId));
    }

    const result = blueprint.removeRequirement(competencyId);
    if (!result.success) {
      return result;
    }

    blueprint.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'RoleRequirementRemoved',
      aggregateId: blueprint.id.toString(),
      aggregateType: 'RoleBlueprint',
      occurredAt: new Date(),
      payload: {
        blueprintId: blueprint.id.toString(),
        competencyId,
      },
      orgId: blueprint.orgId,
      actorId: userId,
      version: blueprint.version,
    });

    await this.repository.save(blueprint);
    return ok(blueprint);
  }

  async getMatchAnalysis(
    blueprintId: string,
    studentCompetencies: StudentCompetencyInput[]
  ): Promise<Result<MatchAnalysisResult>> {
    const blueprint = await this.repository.findEntityById(blueprintId);
    if (!blueprint) {
      return err(new NotFoundError('RoleBlueprint', blueprintId));
    }

    const studentMap = new Map(
      studentCompetencies.map((sc) => [sc.competencyId, sc])
    );

    const importanceMultipliers: Record<string, number> = {
      required: 3.0,
      preferred: 1.5,
      bonus: 0.5,
    };

    const competencyMatches: CompetencyMatchDetail[] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;
    const gaps: CompetencyMatchDetail[] = [];
    const strengths: CompetencyMatchDetail[] = [];

    for (const req of blueprint.requirements) {
      const studentComp = studentMap.get(req.competencyId);
      const importanceMult = importanceMultipliers[req.importance];

      const actualLevel = studentComp?.proficiency ?? 0;
      const confidence = studentComp?.confidence ?? 0;
      const gap = Math.max(0, req.targetLevel - actualLevel);
      const levelScore = req.targetLevel > 0 ? Math.min(1, actualLevel / req.targetLevel) : 0;
      const contribution = (levelScore + confidence * 0.3) * importanceMult * req.weight;
      const maxContribution = (1 + 0.3) * importanceMult * req.weight;

      totalScore += contribution;
      maxPossibleScore += maxContribution;

      const met = actualLevel >= req.targetLevel;

      const detail: CompetencyMatchDetail = {
        competencyId: req.competencyId,
        competencyName: req.competencyName,
        requiredLevel: req.targetLevel,
        actualLevel,
        gap,
        importance: req.importance,
        weight: req.weight,
        met,
        contribution: Math.round(contribution * 100) / 100,
      };

      competencyMatches.push(detail);

      if (gap > 0) {
        gaps.push(detail);
      } else {
        strengths.push(detail);
      }
    }

    const overallScore = maxPossibleScore > 0
      ? Math.min(100, Math.max(0, Math.round((totalScore / maxPossibleScore) * 100)))
      : 0;

    const requirementsMet = competencyMatches.filter((m) => m.met).length;

    return ok({
      blueprintId: blueprint.id.toString(),
      blueprintTitle: blueprint.title,
      overallScore,
      maxPossibleScore: Math.round(maxPossibleScore * 100) / 100,
      rawScore: Math.round(totalScore * 100) / 100,
      competencyMatches,
      gaps: gaps.sort((a, b) => b.gap - a.gap),
      strengths: strengths.sort((a, b) => b.contribution - a.contribution),
      requirementsMet,
      requirementsTotal: blueprint.requirements.length,
      eligibilityPassed: true,
      calculatedAt: new Date(),
    });
  }
}
