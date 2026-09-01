import { Repository } from '../../../shared/persistence/repository.js';
import { Intervention, Enrollment, Outcome } from '../domain/intervention.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface InterventionDocument {
  _id: string;
  title: string;
  description: string;
  type: string;
  competencyIds: string[];
  competencyTargets: Array<{
    competencyId: string;
    targetLevel: number;
  }>;
  startDate: Date;
  endDate: Date;
  capacity: number;
  enrolledCount: number;
  status: string;
  createdBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  updatedBy?: string;
  deletedAt?: Date | null;
}

export class InterventionRepository extends Repository<InterventionDocument> {
  protected collectionName = 'interventions';

  async findEntityById(id: string): Promise<Intervention | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findInterventionById(id: string): Promise<Intervention | null> {
    return this.findEntityById(id);
  }

  async findByOrg(orgId: string, filters?: { status?: string; type?: string }): Promise<Intervention[]> {
    const query: any = { orgId };
    if (filters?.status) query.status = filters.status;
    if (filters?.type) query.type = filters.type;
    const docs = await this.find(query as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findActiveByCompetency(competencyId: string, orgId: string): Promise<Intervention[]> {
    const docs = await this.find({
      orgId,
      competencyIds: competencyId,
      status: 'active',
    } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(intervention: Intervention): Promise<void> {
    const doc = this.toDocument(intervention);
    await this.collection.updateOne(
      { _id: intervention.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.softDeleteById(id);
  }

  private toEntity(doc: InterventionDocument): Intervention {
    return new Intervention({
      id: EntityId.fromString(doc._id.toString()),
      title: doc.title,
      description: doc.description,
      type: doc.type as any,
      competencyIds: doc.competencyIds,
      competencyTargets: doc.competencyTargets as any,
      startDate: doc.startDate,
      endDate: doc.endDate,
      capacity: doc.capacity,
      enrolledCount: doc.enrolledCount,
      status: doc.status,
      createdBy: doc.createdBy,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(i: Intervention): InterventionDocument {
    return {
      _id: i.id.toString(),
      title: i.title,
      description: i.description,
      type: i.type,
      competencyIds: i.competencyIds,
      competencyTargets: i.competencyTargets,
      startDate: i.startDate,
      endDate: i.endDate,
      capacity: i.capacity,
      enrolledCount: i.enrolledCount,
      status: i.status,
      createdBy: i.createdBy,
      orgId: i.orgId,
      version: i.version,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      deletedAt: null,
    };
  }
}

export interface EnrollmentDocument {
  _id: string;
  interventionId: string;
  studentId: string;
  status: string;
  enrolledAt: Date;
  completedAt?: Date;
  notes?: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

export class EnrollmentRepository extends Repository<EnrollmentDocument> {
  protected collectionName = 'enrollments';

  async findByIntervention(interventionId: string): Promise<Enrollment[]> {
    const docs = await this.find({ interventionId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStudent(studentId: string, orgId: string): Promise<Enrollment[]> {
    const docs = await this.find({ studentId, orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByInterventionAndStudent(interventionId: string, studentId: string): Promise<Enrollment | null> {
    const doc = await this.findOne({ interventionId, studentId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByOrg(orgId: string): Promise<Enrollment[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(enrollment: Enrollment): Promise<void> {
    const doc = this.toDocument(enrollment);
    await this.collection.updateOne(
      { _id: enrollment.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: EnrollmentDocument): Enrollment {
    return new Enrollment({
      id: EntityId.fromString(doc._id.toString()),
      interventionId: doc.interventionId,
      studentId: doc.studentId,
      status: doc.status,
      enrolledAt: doc.enrolledAt,
      completedAt: doc.completedAt,
      notes: doc.notes,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(e: Enrollment): EnrollmentDocument {
    return {
      _id: e.id.toString(),
      interventionId: e.interventionId,
      studentId: e.studentId,
      status: e.status,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      notes: e.notes,
      orgId: e.orgId,
      version: e.version,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deletedAt: null,
    };
  }
}

export interface OutcomeDocument {
  _id: string;
  interventionId: string;
  enrollmentId?: string;
  studentId: string;
  competencyId: string;
  beforeLevel: number;
  afterLevel: number;
  beforeConfidence: number;
  afterConfidence: number;
  measuredAt: Date;
  notes?: string;
  orgId: string;
  competencyResults?: Array<{ competencyId: string; beforeLevel: number; afterLevel: number; improvement: number }>;
  matchImpact?: { opportunityId?: string; previousScore?: number; currentScore?: number; algorithmVersion?: string };
  postAssessmentAttemptId?: string;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

export class OutcomeRepository extends Repository<OutcomeDocument> {
  protected collectionName = 'outcomes';

  async findByIntervention(interventionId: string): Promise<Outcome[]> {
    const docs = await this.find({ interventionId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStudent(studentId: string, orgId: string): Promise<Outcome[]> {
    const docs = await this.find({ studentId, orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByInterventionAndStudent(interventionId: string, studentId: string): Promise<Outcome[]> {
    const docs = await this.find({ interventionId, studentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCompetency(competencyId: string, orgId: string): Promise<Outcome[]> {
    const docs = await this.find({ competencyId, orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(outcome: Outcome): Promise<void> {
    const doc = this.toDocument(outcome);
    await this.collection.updateOne(
      { _id: outcome.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: OutcomeDocument): Outcome {
    return new Outcome({
      id: EntityId.fromString(doc._id.toString()),
      interventionId: doc.interventionId,
      enrollmentId: doc.enrollmentId,
      studentId: doc.studentId,
      competencyId: doc.competencyId,
      beforeLevel: doc.beforeLevel,
      afterLevel: doc.afterLevel,
      beforeConfidence: doc.beforeConfidence,
      afterConfidence: doc.afterConfidence,
      measuredAt: doc.measuredAt,
      notes: doc.notes,
      orgId: doc.orgId,
      competencyResults: doc.competencyResults,
      matchImpact: doc.matchImpact,
      postAssessmentAttemptId: doc.postAssessmentAttemptId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(o: Outcome): OutcomeDocument {
    return {
      _id: o.id.toString(),
      interventionId: o.interventionId,
      enrollmentId: o.enrollmentId,
      studentId: o.studentId,
      competencyId: o.competencyId,
      beforeLevel: o.beforeLevel,
      afterLevel: o.afterLevel,
      beforeConfidence: o.beforeConfidence,
      afterConfidence: o.afterConfidence,
      measuredAt: o.measuredAt,
      notes: o.notes,
      orgId: o.orgId,
      competencyResults: o.competencyResults,
      matchImpact: o.matchImpact,
      postAssessmentAttemptId: o.postAssessmentAttemptId,
      version: o.version,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      deletedAt: null,
    };
  }
}
