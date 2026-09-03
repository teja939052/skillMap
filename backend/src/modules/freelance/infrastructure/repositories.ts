import { Repository } from '../../../shared/persistence/repository.js';
import { FreelanceTask } from '../domain/freelance-task.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface FreelanceTaskDocument {
  _id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: Array<{ competencyId: string; minLevel: number; weight: number }>;
  payout: number;
  currency: string;
  estimatedHours: number;
  deadline?: Date;
  postedBy: string;
  orgId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class FreelanceTaskRepository extends Repository<FreelanceTaskDocument> {
  protected collectionName = 'freelance_tasks';

  async findTaskById(id: string): Promise<FreelanceTask | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findTasks(filter: any): Promise<FreelanceTask[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(task: FreelanceTask): Promise<void> {
    const doc = this.toDocument(task);
    await this.collection.updateOne(
      { _id: task.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(d: FreelanceTaskDocument): FreelanceTask {
    return new FreelanceTask({
      id: EntityId.fromString(d._id.toString()),
      title: d.title,
      description: d.description,
      category: d.category,
      requiredSkills: d.requiredSkills as any,
      payout: d.payout,
      currency: d.currency,
      estimatedHours: d.estimatedHours,
      deadline: d.deadline,
      postedBy: d.postedBy,
      orgId: d.orgId,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }

  private toDocument(t: FreelanceTask): FreelanceTaskDocument {
    return {
      _id: t.id.toString(),
      title: t.title,
      description: t.description,
      category: t.category,
      requiredSkills: t.requiredSkills,
      payout: t.payout,
      currency: t.currency,
      estimatedHours: t.estimatedHours,
      deadline: t.deadline,
      postedBy: t.postedBy,
      orgId: t.orgId,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      deletedAt: null,
    };
  }
}
