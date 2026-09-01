import { Repository } from '../../../shared/persistence/repository.js';
import { RoleBlueprint, RoleRequirement, EligibilityRules } from '../domain/role-blueprint.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface RoleBlueprintDocument {
  _id: string;
  title: string;
  organizationId: string;
  roleFamily: string;
  description?: string;
  requirements: Array<{
    competencyId: string;
    competencyName: string;
    targetLevel: number;
    importance: 'required' | 'preferred' | 'bonus';
    weight: number;
    evidenceRule?: string;
    freshness?: number;
  }>;
  eligibilityRules: {
    minGpa?: number;
    departments?: string[];
    yearsOfStudy?: number[];
  };
  status: string;
  version: number;
  publishedAt?: Date;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class RoleBlueprintRepository extends Repository<RoleBlueprintDocument> {
  protected collectionName = 'role_blueprints';

  async findEntityById(id: string): Promise<RoleBlueprint | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByOrganization(organizationId: string): Promise<RoleBlueprint[]> {
    const docs = await this.find({ organizationId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByRoleFamily(roleFamily: string, orgId: string): Promise<RoleBlueprint[]> {
    const docs = await this.find({ roleFamily, orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findPublished(orgId: string): Promise<RoleBlueprint[]> {
    const docs = await this.find({ orgId, status: 'published' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findBlueprints(filter: Partial<RoleBlueprintDocument>): Promise<RoleBlueprint[]> {
    const docs = await this.find(filter as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(blueprint: RoleBlueprint): Promise<void> {
    const doc = this.toDocument(blueprint);
    await this.collection.updateOne(
      { _id: blueprint.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: RoleBlueprintDocument): RoleBlueprint {
    return new RoleBlueprint({
      id: EntityId.fromString(doc._id.toString()),
      title: doc.title,
      organizationId: doc.organizationId,
      roleFamily: doc.roleFamily,
      description: doc.description,
      requirements: doc.requirements as RoleRequirement[],
      eligibilityRules: doc.eligibilityRules as EligibilityRules,
      status: doc.status as any,
      version: doc.version,
      publishedAt: doc.publishedAt,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(b: RoleBlueprint): RoleBlueprintDocument {
    return {
      _id: b.id.toString(),
      title: b.title,
      organizationId: b.organizationId,
      roleFamily: b.roleFamily,
      description: b.description,
      requirements: b.requirements as RoleRequirement[],
      eligibilityRules: b.eligibilityRules,
      status: b.status,
      version: b.version,
      publishedAt: b.publishedAt,
      orgId: b.orgId,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      deletedAt: null,
    };
  }
}
