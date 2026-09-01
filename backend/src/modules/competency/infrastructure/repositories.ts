import { Repository } from '../../../shared/persistence/repository.js';
import { Competency, StudentCompetency } from '../domain/competency.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface CompetencyDocument {
  _id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  domain?: string;
  parentId?: string;
  keywords: string[];
  aliases: string[];
  evidenceTypes: string[];
  status: string;
  taxonomyVersion: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class CompetencyRepository extends Repository<CompetencyDocument> {
  protected collectionName = 'competencies';

  async findBySlug(slug: string): Promise<Competency | null> {
    const doc = await this.findOne({ slug } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findEntityById(id: string): Promise<Competency | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findCompetencyById(id: string): Promise<Competency | null> {
    return this.findEntityById(id);
  }

  async findActive(): Promise<Competency[]> {
    const docs = await this.find({ status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByDomain(domain: string): Promise<Competency[]> {
    const docs = await this.find({ domain, status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findCompetencies(filter: any): Promise<Competency[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(competency: Competency): Promise<void> {
    const doc = this.toDocument(competency);
    await this.collection.updateOne(
      { _id: competency.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: CompetencyDocument): Competency {
    return new Competency({
      id: EntityId.fromString(doc._id.toString()),
      name: doc.name,
      slug: doc.slug,
      type: doc.type as any,
      description: doc.description,
      domain: doc.domain,
      parentId: doc.parentId ? EntityId.fromString(doc.parentId) : undefined,
      keywords: doc.keywords || [],
      aliases: doc.aliases || [],
      evidenceTypes: doc.evidenceTypes || [],
      status: doc.status as any,
      taxonomyVersion: doc.taxonomyVersion,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(c: Competency): CompetencyDocument {
    return {
      _id: c.id.toString(),
      name: c.name,
      slug: c.slug,
      type: c.type,
      description: c.description,
      domain: c.domain,
      parentId: c.parentId?.toString(),
      keywords: c.keywords,
      aliases: c.aliases,
      evidenceTypes: c.evidenceTypes,
      status: c.status,
      taxonomyVersion: c.taxonomyVersion,
      version: c.version,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      deletedAt: null,
    };
  }
}

export interface StudentCompetencyDocument {
  _id: string;
  studentId: string;
  competencyId: string;
  proficiency: number;
  confidence: number;
  evidenceCount: number;
  lastAssessedAt?: Date;
  calculationVersion: number;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class StudentCompetencyRepository extends Repository<StudentCompetencyDocument> {
  protected collectionName = 'student_competencies';

  async findByStudent(studentId: string): Promise<StudentCompetency[]> {
    const docs = await this.find({ studentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStudentAndCompetency(studentId: string, competencyId: string): Promise<StudentCompetency | null> {
    const doc = await this.findOne({ studentId, competencyId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async save(projection: StudentCompetency): Promise<void> {
    const doc = this.toDocument(projection);
    await this.collection.updateOne(
      { _id: projection.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  async bulkSave(projections: StudentCompetency[]): Promise<void> {
    if (projections.length === 0) return;
    const ops = projections.map((p) => ({
      updateOne: {
        filter: { _id: p.id.toString() },
        update: { $set: this.toDocument(p) },
        upsert: true,
      },
    }));
    await this.collection.bulkWrite(ops as any);
  }

  private toEntity(doc: StudentCompetencyDocument): StudentCompetency {
    return new StudentCompetency({
      id: EntityId.fromString(doc._id.toString()),
      studentId: doc.studentId,
      competencyId: doc.competencyId,
      proficiency: doc.proficiency,
      confidence: doc.confidence,
      evidenceCount: doc.evidenceCount,
      lastAssessedAt: doc.lastAssessedAt,
      calculationVersion: doc.calculationVersion,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(p: StudentCompetency): StudentCompetencyDocument {
    return {
      _id: p.id.toString(),
      studentId: p.studentId,
      competencyId: p.competencyId,
      proficiency: p.proficiency,
      confidence: p.confidence,
      evidenceCount: p.evidenceCount,
      lastAssessedAt: p.lastAssessedAt,
      calculationVersion: p.calculationVersion,
      version: p.version,
      status: 'active',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: null,
    };
  }
}
