import { Repository } from '../../../shared/persistence/repository.js';
import {
  Institution,
  Department,
  Program,
  Curriculum,
  CurriculumMapping,
  Cohort,
} from '../domain/institution.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface InstitutionDocument {
  _id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  accreditation?: string[];
  logoUrl?: string;
  establishedYear?: number;
  status: string;
  orgId: string;
  metadata?: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class InstitutionRepository extends Repository<InstitutionDocument> {
  protected collectionName = 'institutions';

  async findEntityById(id: string): Promise<Institution | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findBySlug(slug: string): Promise<Institution | null> {
    const doc = await this.findOne({ slug } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByOrg(orgId: string): Promise<Institution[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findActive(): Promise<Institution[]> {
    const docs = await this.find({ status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findInstitutions(filter: any): Promise<Institution[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(institution: Institution): Promise<void> {
    const doc = this.toDocument(institution);
    await this.collection.updateOne(
      { _id: institution.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: InstitutionDocument): Institution {
    return new Institution({
      id: EntityId.fromString(doc._id.toString()),
      name: doc.name,
      slug: doc.slug,
      type: doc.type as any,
      description: doc.description,
      website: doc.website,
      email: doc.email,
      phone: doc.phone,
      address: doc.address,
      accreditation: doc.accreditation ?? [],
      logoUrl: doc.logoUrl,
      establishedYear: doc.establishedYear,
      status: doc.status as any,
      orgId: doc.orgId,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(i: Institution): InstitutionDocument {
    return {
      _id: i.id.toString(),
      name: i.name,
      slug: i.slug,
      type: i.type,
      description: i.description,
      website: i.website,
      email: i.email,
      phone: i.phone,
      address: i.address,
      accreditation: i.accreditation,
      logoUrl: i.logoUrl,
      establishedYear: i.establishedYear,
      status: i.status,
      orgId: i.orgId,
      metadata: i.metadata,
      version: i.version,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      deletedAt: null,
    };
  }
}

export interface DepartmentDocument {
  _id: string;
  institutionId: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  email?: string;
  phone?: string;
  status: string;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class DepartmentRepository extends Repository<DepartmentDocument> {
  protected collectionName = 'departments';

  async findEntityById(id: string): Promise<Department | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByInstitution(institutionId: string): Promise<Department[]> {
    const docs = await this.find({ institutionId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCode(institutionId: string, code: string): Promise<Department | null> {
    const doc = await this.findOne({ institutionId, code } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findDepartments(filter: any): Promise<Department[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(department: Department): Promise<void> {
    const doc = this.toDocument(department);
    await this.collection.updateOne(
      { _id: department.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: DepartmentDocument): Department {
    return new Department({
      id: EntityId.fromString(doc._id.toString()),
      institutionId: doc.institutionId,
      name: doc.name,
      code: doc.code,
      description: doc.description,
      headOfDepartment: doc.headOfDepartment,
      email: doc.email,
      phone: doc.phone,
      status: doc.status as any,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(d: Department): DepartmentDocument {
    return {
      _id: d.id.toString(),
      institutionId: d.institutionId,
      name: d.name,
      code: d.code,
      description: d.description,
      headOfDepartment: d.headOfDepartment,
      email: d.email,
      phone: d.phone,
      status: d.status,
      orgId: d.orgId,
      version: d.version,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      deletedAt: null,
    };
  }
}

export interface ProgramDocument {
  _id: string;
  institutionId: string;
  departmentId?: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  duration: number;
  durationUnit: string;
  totalCredits?: number;
  eligibility?: string[];
  outcomes?: string[];
  status: string;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class ProgramRepository extends Repository<ProgramDocument> {
  protected collectionName = 'programs';

  async findEntityById(id: string): Promise<Program | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByInstitution(institutionId: string): Promise<Program[]> {
    const docs = await this.find({ institutionId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByDepartment(departmentId: string): Promise<Program[]> {
    const docs = await this.find({ departmentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCode(institutionId: string, code: string): Promise<Program | null> {
    const doc = await this.findOne({ institutionId, code } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findPrograms(filter: any): Promise<Program[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(program: Program): Promise<void> {
    const doc = this.toDocument(program);
    await this.collection.updateOne(
      { _id: program.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: ProgramDocument): Program {
    return new Program({
      id: EntityId.fromString(doc._id.toString()),
      institutionId: doc.institutionId,
      departmentId: doc.departmentId,
      name: doc.name,
      code: doc.code,
      type: doc.type as any,
      description: doc.description,
      duration: doc.duration,
      durationUnit: doc.durationUnit as any,
      totalCredits: doc.totalCredits,
      eligibility: doc.eligibility ?? [],
      outcomes: doc.outcomes ?? [],
      status: doc.status as any,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(p: Program): ProgramDocument {
    return {
      _id: p.id.toString(),
      institutionId: p.institutionId,
      departmentId: p.departmentId,
      name: p.name,
      code: p.code,
      type: p.type,
      description: p.description,
      duration: p.duration,
      durationUnit: p.durationUnit,
      totalCredits: p.totalCredits,
      eligibility: p.eligibility,
      outcomes: p.outcomes,
      status: p.status,
      orgId: p.orgId,
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: null,
    };
  }
}

export interface CurriculumDocument {
  _id: string;
  institutionId: string;
  programId: string;
  name: string;
  version: string;
  description?: string;
  totalCredits: number;
  totalSemesters: number;
  courses: Array<{
    courseId: string;
    courseCode: string;
    courseName: string;
    credits: number;
    semester: number;
    isCore: boolean;
    prerequisites?: string[];
    description?: string;
  }>;
  status: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class CurriculumRepository extends Repository<CurriculumDocument> {
  protected collectionName = 'curricula';

  async findEntityById(id: string): Promise<Curriculum | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByInstitution(institutionId: string): Promise<Curriculum[]> {
    const docs = await this.find({ institutionId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByProgram(programId: string): Promise<Curriculum[]> {
    const docs = await this.find({ programId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findActiveByProgram(programId: string): Promise<Curriculum | null> {
    const doc = await this.findOne({ programId, status: 'active' } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findCurricula(filter: any): Promise<Curriculum[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(curriculum: Curriculum): Promise<void> {
    const doc = this.toDocument(curriculum);
    await this.collection.updateOne(
      { _id: curriculum.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: CurriculumDocument): Curriculum {
    return new Curriculum({
      id: EntityId.fromString(doc._id.toString()),
      institutionId: doc.institutionId,
      programId: doc.programId,
      name: doc.name,
      version: doc.version,
      description: doc.description,
      totalCredits: doc.totalCredits,
      totalSemesters: doc.totalSemesters,
      courses: doc.courses,
      status: doc.status as any,
      effectiveFrom: doc.effectiveFrom,
      effectiveTo: doc.effectiveTo,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(c: Curriculum): CurriculumDocument {
    return {
      _id: c.id.toString(),
      institutionId: c.institutionId,
      programId: c.programId,
      name: c.name,
      version: c.curriculumVersion,
      description: c.description,
      totalCredits: c.totalCredits,
      totalSemesters: c.totalSemesters,
      courses: c.courses as any,
      status: c.status,
      effectiveFrom: c.effectiveFrom,
      effectiveTo: c.effectiveTo,
      orgId: c.orgId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      deletedAt: null,
    };
  }
}

export interface CurriculumMappingDocument {
  _id: string;
  curriculumId: string;
  courseId: string;
  competencyId: string;
  proficiencyTarget: number;
  mappingType: string;
  semester?: number;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class CurriculumMappingRepository extends Repository<CurriculumMappingDocument> {
  protected collectionName = 'curriculum_mappings';

  async findEntityById(id: string): Promise<CurriculumMapping | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByCurriculum(curriculumId: string): Promise<CurriculumMapping[]> {
    const docs = await this.find({ curriculumId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCompetency(competencyId: string): Promise<CurriculumMapping[]> {
    const docs = await this.find({ competencyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCourse(courseId: string): Promise<CurriculumMapping[]> {
    const docs = await this.find({ courseId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findMappings(filter: any): Promise<CurriculumMapping[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(mapping: CurriculumMapping): Promise<void> {
    const doc = this.toDocument(mapping);
    await this.collection.updateOne(
      { _id: mapping.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: CurriculumMappingDocument): CurriculumMapping {
    return new CurriculumMapping({
      id: EntityId.fromString(doc._id.toString()),
      curriculumId: doc.curriculumId,
      courseId: doc.courseId,
      competencyId: doc.competencyId,
      proficiencyTarget: doc.proficiencyTarget,
      mappingType: doc.mappingType as any,
      semester: doc.semester,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(m: CurriculumMapping): CurriculumMappingDocument {
    return {
      _id: m.id.toString(),
      curriculumId: m.curriculumId,
      courseId: m.courseId,
      competencyId: m.competencyId,
      proficiencyTarget: m.proficiencyTarget,
      mappingType: m.mappingType,
      semester: m.semester,
      orgId: m.orgId,
      version: m.version,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: null,
    };
  }
}

export interface CohortDocument {
  _id: string;
  institutionId: string;
  programId: string;
  name: string;
  code: string;
  academicYear: string;
  startDate: Date;
  endDate?: Date;
  expectedGraduation?: Date;
  maxStudents?: number;
  currentEnrollment: number;
  status: string;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class CohortRepository extends Repository<CohortDocument> {
  protected collectionName = 'cohorts';

  async findEntityById(id: string): Promise<Cohort | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByInstitution(institutionId: string): Promise<Cohort[]> {
    const docs = await this.find({ institutionId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByProgram(programId: string): Promise<Cohort[]> {
    const docs = await this.find({ programId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCode(institutionId: string, code: string): Promise<Cohort | null> {
    const doc = await this.findOne({ institutionId, code } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findCohorts(filter: any): Promise<Cohort[]> {
    const docs = await this.find(filter);
    return docs.map((d) => this.toEntity(d));
  }

  async save(cohort: Cohort): Promise<void> {
    const doc = this.toDocument(cohort);
    await this.collection.updateOne(
      { _id: cohort.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: CohortDocument): Cohort {
    return new Cohort({
      id: EntityId.fromString(doc._id.toString()),
      institutionId: doc.institutionId,
      programId: doc.programId,
      name: doc.name,
      code: doc.code,
      academicYear: doc.academicYear,
      startDate: doc.startDate,
      endDate: doc.endDate,
      expectedGraduation: doc.expectedGraduation,
      maxStudents: doc.maxStudents,
      currentEnrollment: doc.currentEnrollment,
      status: doc.status as any,
      orgId: doc.orgId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(c: Cohort): CohortDocument {
    return {
      _id: c.id.toString(),
      institutionId: c.institutionId,
      programId: c.programId,
      name: c.name,
      code: c.code,
      academicYear: c.academicYear,
      startDate: c.startDate,
      endDate: c.endDate,
      expectedGraduation: c.expectedGraduation,
      maxStudents: c.maxStudents,
      currentEnrollment: c.currentEnrollment,
      status: c.status,
      orgId: c.orgId,
      version: c.version,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      deletedAt: null,
    };
  }
}
