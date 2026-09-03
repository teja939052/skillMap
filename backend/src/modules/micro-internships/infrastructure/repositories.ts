import { Repository } from '../../../shared/persistence/repository.js';
import { EntityId } from '../../../shared/domain/entity.js';
import { MicroInternship, MicroInternshipApplication, MicroInternshipProps, MicroInternshipApplicationProps } from '../domain/micro-internship.js';

export interface MicroInternshipDocument {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  postedBy: string;
  orgId: string;
  requiredSkills: MicroInternshipProps['requiredSkills'];
  durationDays: number;
  stipend?: number;
  currency: string;
  positions: number;
  status: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface MicroInternshipApplicationDocument {
  _id: string;
  internshipId: string;
  studentId: string;
  message: string;
  status: string;
  evaluationScore?: number;
  evaluationFeedback?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class MicroInternshipRepository extends Repository<MicroInternshipDocument> {
  protected collectionName = 'micro_internships';

  async findInternshipById(id: string): Promise<MicroInternship | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findInternships(filter: any): Promise<MicroInternship[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(ms: MicroInternship): Promise<void> {
    const doc = this.toDocument(ms);
    await this.collection.updateOne({ _id: ms.id.toString() } as any, { $set: doc }, { upsert: true });
  }

  private toEntity(d: MicroInternshipDocument): MicroInternship {
    return new MicroInternship({
      id: EntityId.fromString(d._id.toString()),
      title: d.title,
      description: d.description,
      companyName: d.companyName,
      postedBy: d.postedBy,
      orgId: d.orgId,
      requiredSkills: d.requiredSkills as any,
      durationDays: d.durationDays,
      stipend: d.stipend,
      currency: d.currency,
      positions: d.positions,
      status: d.status as any,
      deadline: d.deadline,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }

  private toDocument(m: MicroInternship): MicroInternshipDocument {
    return {
      _id: m.id.toString(),
      title: m.title,
      description: m.description,
      companyName: m.companyName,
      postedBy: m.postedBy,
      orgId: m.orgId,
      requiredSkills: m.requiredSkills,
      durationDays: m.durationDays,
      stipend: m.stipend,
      currency: m.currency,
      positions: m.positions,
      status: m.status as any,
      deadline: m.deadline,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: null,
    };
  }
}

export class MicroInternshipApplicationRepository extends Repository<MicroInternshipApplicationDocument> {
  protected collectionName = 'micro_internship_applications';

  async findApplicationById(id: string): Promise<MicroInternshipApplication | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findApplications(filter: any): Promise<MicroInternshipApplication[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStudentAndInternship(internshipId: string, studentId: string): Promise<MicroInternshipApplication | null> {
    const doc = await this.findOne({ internshipId, studentId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async save(app: MicroInternshipApplication): Promise<void> {
    const doc = this.toDocument(app);
    await this.collection.updateOne({ _id: app.id.toString() } as any, { $set: doc }, { upsert: true });
  }

  private toEntity(d: MicroInternshipApplicationDocument): MicroInternshipApplication {
    return new MicroInternshipApplication({
      id: EntityId.fromString(d._id.toString()),
      internshipId: d.internshipId,
      studentId: d.studentId,
      message: d.message,
      status: d.status as any,
      evaluationScore: d.evaluationScore,
      evaluationFeedback: d.evaluationFeedback,
      orgId: d.orgId,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }

  private toDocument(a: MicroInternshipApplication): MicroInternshipApplicationDocument {
    return {
      _id: a.id.toString(),
      internshipId: a.internshipId,
      studentId: a.studentId,
      message: a.message,
      status: a.status,
      evaluationScore: a.evaluationScore,
      evaluationFeedback: a.evaluationFeedback,
      orgId: a.orgId,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      deletedAt: null,
    };
  }
}