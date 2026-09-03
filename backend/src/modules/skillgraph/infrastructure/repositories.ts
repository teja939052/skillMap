import { Repository } from '../../../shared/persistence/repository.js';
import { SkillGraphNode } from '../domain/skill-graph.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface SkillGraphNodeDocument {
  _id: string;
  competencyId: string;
  name: string;
  type: string;
  parentIds: string[];
  childIds: string[];
  targetRoleIds: string[];
  domain: string;
  difficulty: number;
  estimatedHours: number;
  prerequisites: string[];
  orgId: string;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class SkillGraphRepository extends Repository<SkillGraphNodeDocument> {
  protected collectionName = 'skill_graph_nodes';

  async findByCompetency(competencyId: string): Promise<SkillGraphNode | null> {
    const doc = await this.findOne({ competencyId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByDomain(domain: string): Promise<SkillGraphNode[]> {
    const docs = await this.find({ domain } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async listAll(): Promise<SkillGraphNode[]> {
    const docs = await this.find({} as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(node: SkillGraphNode): Promise<void> {
    const doc = this.toDocument(node);
    await this.collection.updateOne(
      { _id: node.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  async bulkSave(nodes: SkillGraphNode[]): Promise<void> {
    if (nodes.length === 0) return;
    const ops = nodes.map((n) => ({
      updateOne: {
        filter: { _id: n.id.toString() },
        update: { $set: this.toDocument(n) },
        upsert: true,
      },
    }));
    await this.collection.bulkWrite(ops as any);
  }

  private toEntity(doc: SkillGraphNodeDocument): SkillGraphNode {
    return new SkillGraphNode({
      id: EntityId.fromString(doc._id.toString()),
      competencyId: doc.competencyId,
      name: doc.name,
      type: doc.type,
      parentIds: doc.parentIds || [],
      childIds: doc.childIds || [],
      targetRoleIds: doc.targetRoleIds || [],
      domain: doc.domain,
      difficulty: doc.difficulty,
      estimatedHours: doc.estimatedHours,
      prerequisites: doc.prerequisites || [],
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(n: SkillGraphNode): SkillGraphNodeDocument {
    return {
      _id: n.id.toString(),
      competencyId: n.competencyId,
      name: n.name,
      type: n.type,
      parentIds: n.parentIds,
      childIds: n.childIds,
      targetRoleIds: n.targetRoleIds,
      domain: n.domain,
      difficulty: n.difficulty,
      estimatedHours: n.estimatedHours,
      prerequisites: n.prerequisites,
      orgId: n.orgId,
      version: n.version,
      status: 'active',
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      deletedAt: null,
    };
  }
}
