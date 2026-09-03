import { Repository } from '../../../shared/persistence/repository.js';
import { EntityId } from '../../../shared/domain/entity.js';
import { IndustrySkillRequest, IndustrySkillRequestProps } from '../domain/skill-request.js';

export interface SkillRequestDocument {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  postedBy: string;
  orgId: string;
  requirements: IndustrySkillRequestProps['requirements'];
  projectDurationDays: number;
  status: string;
  supply?: number;
  shortfall?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class SkillRequestRepository extends Repository<SkillRequestDocument> {
  protected collectionName = 'industry_skill_requests';

  async findRequestById(id: string): Promise<IndustrySkillRequest | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findRequests(filter: any): Promise<IndustrySkillRequest[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(req: IndustrySkillRequest): Promise<void> {
    const doc = this.toDocument(req);
    await this.collection.updateOne({ _id: req.id.toString() } as any, { $set: doc }, { upsert: true });
  }

  private toEntity(d: SkillRequestDocument): IndustrySkillRequest {
    return new IndustrySkillRequest({
      id: EntityId.fromString(d._id.toString()),
      title: d.title,
      description: d.description,
      companyName: d.companyName,
      postedBy: d.postedBy,
      orgId: d.orgId,
      requirements: d.requirements,
      projectDurationDays: d.projectDurationDays,
      status: d.status as any,
      supply: d.supply,
      shortfall: d.shortfall,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }

  private toDocument(r: IndustrySkillRequest): SkillRequestDocument {
    return {
      _id: r.id.toString(),
      title: r.title,
      description: r.description,
      companyName: r.companyName,
      postedBy: r.postedBy,
      orgId: r.orgId,
      requirements: r.requirements,
      projectDurationDays: r.projectDurationDays,
      status: r.status,
      supply: r.supply,
      shortfall: r.shortfall,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: null,
    };
  }
}
