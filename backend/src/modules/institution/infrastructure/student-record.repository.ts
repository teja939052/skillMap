import { Repository } from '../../../shared/persistence/repository.js';
import { StudentRecord, StudentRecordProps } from '../domain/student-record.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface StudentRecordDocument {
  _id: string;
  institutionId: string;
  rollNumber: string;
  name: string;
  email?: string;
  program?: string;
  department?: string;
  cohort?: string;
  section?: string;
  phone?: string;
  status: string;
  source: string;
  userId?: string;
  orgId: string;
  importedBy: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class StudentRecordRepository extends Repository<StudentRecordDocument> {
  protected collectionName = 'student_records';

  async ensureIndexes() {
    await this.collection.createIndex({ institutionId: 1, rollNumber: 1 }, { unique: true, background: true });
    await this.collection.createIndex({ institutionId: 1, status: 1 }, { background: true });
    await this.collection.createIndex({ userId: 1 }, { background: true, sparse: true });
  }

  async findByInstitution(institutionId: string, filters?: { status?: string; limit?: number }): Promise<StudentRecord[]> {
    const q: any = { institutionId };
    if (filters?.status) q.status = filters.status;
    const docs = await this.find(q, { limit: filters?.limit } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByRoll(institutionId: string, rollNumber: string): Promise<StudentRecord | null> {
    const doc = await this.findOne({ institutionId, rollNumber: rollNumber.trim().toUpperCase() } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUser(userId: string): Promise<StudentRecord | null> {
    const doc = await this.findOne({ userId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(institutionId: string, email: string): Promise<StudentRecord | null> {
    const doc = await this.findOne({ institutionId, email: email.toLowerCase().trim() } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async save(record: StudentRecord): Promise<void> {
    const doc = this.toDocument(record);
    await this.collection.updateOne(
      { _id: record.id.toString() } as any,
      { $set: doc },
      { upsert: true },
    );
  }

  async bulkSave(records: StudentRecord[]): Promise<void> {
    if (!records.length) return;
    const ops = records.map((r) => ({
      updateOne: { filter: { _id: r.id.toString() }, update: { $set: this.toDocument(r) }, upsert: true },
    }));
    await this.collection.bulkWrite(ops as any);
  }

  private toEntity(doc: StudentRecordDocument): StudentRecord {
    return new StudentRecord({
      id: EntityId.fromString(doc._id.toString()),
      institutionId: doc.institutionId,
      rollNumber: doc.rollNumber,
      name: doc.name,
      email: doc.email,
      program: doc.program,
      department: doc.department,
      cohort: doc.cohort,
      section: doc.section,
      phone: doc.phone,
      status: doc.status as any,
      source: doc.source as any,
      userId: doc.userId,
      orgId: doc.orgId,
      importedBy: doc.importedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(r: StudentRecord): StudentRecordDocument {
    return {
      _id: r.id.toString(),
      institutionId: r.institutionId,
      rollNumber: r.rollNumber,
      name: r.name,
      email: r.email,
      program: r.program,
      department: r.department,
      cohort: r.cohort,
      section: r.section,
      phone: r.phone,
      status: r.status,
      source: r.source,
      userId: r.userId,
      orgId: r.orgId,
      importedBy: r.importedBy,
      version: r.version,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: null,
    };
  }
}
