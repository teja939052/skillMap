import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, NotFoundError, ValidationError, ConflictError } from '../../../shared/domain/result.js';
import {
  Institution,
  Department,
  Program,
  Curriculum,
  CurriculumMapping,
  Cohort,
} from '../domain/institution.js';
import {
  InstitutionRepository,
  DepartmentRepository,
  ProgramRepository,
  CurriculumRepository,
  CurriculumMappingRepository,
  CohortRepository,
} from '../infrastructure/repositories.js';

export interface CreateInstitutionData {
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
  orgId: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateInstitutionData {
  name?: string;
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
  metadata?: Record<string, unknown>;
}

export interface CreateDepartmentData {
  institutionId: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  email?: string;
  phone?: string;
  orgId: string;
}

export interface CreateProgramData {
  institutionId: string;
  departmentId?: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  duration: number;
  durationUnit: 'years' | 'months' | 'weeks' | 'semesters';
  totalCredits?: number;
  eligibility?: string[];
  outcomes?: string[];
  orgId: string;
}

export interface CreateCurriculumData {
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
  effectiveFrom?: Date;
  effectiveTo?: Date;
  orgId: string;
}

export interface MapCompetencyData {
  curriculumId: string;
  courseId: string;
  competencyId: string;
  proficiencyTarget: number;
  mappingType: 'primary' | 'secondary' | 'supplementary';
  semester?: number;
  orgId: string;
}

export interface CreateCohortData {
  institutionId: string;
  programId: string;
  name: string;
  code: string;
  academicYear: string;
  startDate: Date;
  endDate?: Date;
  expectedGraduation?: Date;
  maxStudents?: number;
  orgId: string;
}

export class InstitutionService {
  constructor(
    private readonly institutionRepo: InstitutionRepository,
    private readonly departmentRepo: DepartmentRepository,
    private readonly programRepo: ProgramRepository,
    private readonly curriculumRepo: CurriculumRepository,
    private readonly curriculumMappingRepo: CurriculumMappingRepository,
    private readonly cohortRepo: CohortRepository,
  ) {}

  async createInstitution(data: CreateInstitutionData, userId: string): Promise<Result<Institution>> {
    if (!data.name || !data.name.trim()) {
      return err(new ValidationError('Institution name is required'));
    }
    if (!data.slug || !data.slug.trim()) {
      return err(new ValidationError('Institution slug is required'));
    }
    if (!data.type) {
      return err(new ValidationError('Institution type is required'));
    }

    const existing = await this.institutionRepo.findBySlug(data.slug);
    if (existing) {
      return err(new ConflictError(`Institution with slug '${data.slug}' already exists`));
    }

    const institution = new Institution({
      id: EntityId.create(),
      name: data.name.trim(),
      slug: data.slug.trim(),
      type: data.type as any,
      description: data.description,
      website: data.website,
      email: data.email,
      phone: data.phone,
      address: data.address,
      accreditation: data.accreditation ?? [],
      logoUrl: data.logoUrl,
      establishedYear: data.establishedYear,
      status: 'active',
      orgId: data.orgId,
      metadata: data.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    institution.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InstitutionCreated',
      aggregateId: institution.id.toString(),
      aggregateType: 'Institution',
      occurredAt: new Date(),
      payload: { institutionId: institution.id.toString(), name: institution.name, type: institution.type },
      orgId: institution.orgId,
      actorId: userId,
      version: 1,
    });

    await this.institutionRepo.save(institution);
    return ok(institution);
  }

  async getById(id: string): Promise<Result<Institution>> {
    const institution = await this.institutionRepo.findEntityById(id);
    if (!institution) {
      return err(new NotFoundError('Institution', id));
    }
    return ok(institution);
  }

  async update(id: string, updates: UpdateInstitutionData, userId: string): Promise<Result<Institution>> {
    const institution = await this.institutionRepo.findEntityById(id);
    if (!institution) {
      return err(new NotFoundError('Institution', id));
    }

    institution.update(updates);
    institution.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'InstitutionUpdated',
      aggregateId: institution.id.toString(),
      aggregateType: 'Institution',
      occurredAt: new Date(),
      payload: { institutionId: institution.id.toString(), updates },
      orgId: institution.orgId,
      actorId: userId,
      version: institution.version,
    });

    await this.institutionRepo.save(institution);
    return ok(institution);
  }

  async listDepartments(institutionId: string): Promise<Result<Department[]>> {
    const departments = await this.departmentRepo.findByInstitution(institutionId);
    return ok(departments);
  }

  async createDepartment(data: CreateDepartmentData): Promise<Result<Department>> {
    if (!data.name || !data.name.trim()) {
      return err(new ValidationError('Department name is required'));
    }
    if (!data.code || !data.code.trim()) {
      return err(new ValidationError('Department code is required'));
    }
    if (!data.institutionId) {
      return err(new ValidationError('Institution ID is required'));
    }

    const institution = await this.institutionRepo.findEntityById(data.institutionId);
    if (!institution) {
      return err(new NotFoundError('Institution', data.institutionId));
    }

    const existing = await this.departmentRepo.findByCode(data.institutionId, data.code);
    if (existing) {
      return err(new ConflictError(`Department with code '${data.code}' already exists in this institution`));
    }

    const department = new Department({
      id: EntityId.create(),
      institutionId: data.institutionId,
      name: data.name.trim(),
      code: data.code.trim(),
      description: data.description,
      headOfDepartment: data.headOfDepartment,
      email: data.email,
      phone: data.phone,
      status: 'active',
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    department.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DepartmentCreated',
      aggregateId: department.id.toString(),
      aggregateType: 'Department',
      occurredAt: new Date(),
      payload: { departmentId: department.id.toString(), institutionId: data.institutionId, name: department.name },
      orgId: data.orgId,
      version: 1,
    });

    await this.departmentRepo.save(department);
    return ok(department);
  }

  async listPrograms(institutionId: string): Promise<Result<Program[]>> {
    const programs = await this.programRepo.findByInstitution(institutionId);
    return ok(programs);
  }

  async createProgram(data: CreateProgramData): Promise<Result<Program>> {
    if (!data.name || !data.name.trim()) {
      return err(new ValidationError('Program name is required'));
    }
    if (!data.code || !data.code.trim()) {
      return err(new ValidationError('Program code is required'));
    }
    if (!data.type) {
      return err(new ValidationError('Program type is required'));
    }
    if (!data.duration || data.duration <= 0) {
      return err(new ValidationError('Program duration must be positive'));
    }
    if (!data.institutionId) {
      return err(new ValidationError('Institution ID is required'));
    }

    const institution = await this.institutionRepo.findEntityById(data.institutionId);
    if (!institution) {
      return err(new NotFoundError('Institution', data.institutionId));
    }

    const existing = await this.programRepo.findByCode(data.institutionId, data.code);
    if (existing) {
      return err(new ConflictError(`Program with code '${data.code}' already exists in this institution`));
    }

    const program = new Program({
      id: EntityId.create(),
      institutionId: data.institutionId,
      departmentId: data.departmentId,
      name: data.name.trim(),
      code: data.code.trim(),
      type: data.type as any,
      description: data.description,
      duration: data.duration,
      durationUnit: data.durationUnit,
      totalCredits: data.totalCredits,
      eligibility: data.eligibility ?? [],
      outcomes: data.outcomes ?? [],
      status: 'active',
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    program.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'ProgramCreated',
      aggregateId: program.id.toString(),
      aggregateType: 'Program',
      occurredAt: new Date(),
      payload: { programId: program.id.toString(), institutionId: data.institutionId, name: program.name },
      orgId: data.orgId,
      version: 1,
    });

    await this.programRepo.save(program);
    return ok(program);
  }

  async createCurriculum(data: CreateCurriculumData): Promise<Result<Curriculum>> {
    if (!data.name || !data.name.trim()) {
      return err(new ValidationError('Curriculum name is required'));
    }
    if (!data.version || !data.version.trim()) {
      return err(new ValidationError('Curriculum version is required'));
    }
    if (!data.institutionId) {
      return err(new ValidationError('Institution ID is required'));
    }
    if (!data.programId) {
      return err(new ValidationError('Program ID is required'));
    }

    const program = await this.programRepo.findEntityById(data.programId);
    if (!program) {
      return err(new NotFoundError('Program', data.programId));
    }

    const curriculum = new Curriculum({
      id: EntityId.create(),
      institutionId: data.institutionId,
      programId: data.programId,
      name: data.name.trim(),
      version: data.version.trim(),
      description: data.description,
      totalCredits: data.totalCredits,
      totalSemesters: data.totalSemesters,
      courses: data.courses ?? [],
      status: 'draft',
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    curriculum.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'CurriculumCreated',
      aggregateId: curriculum.id.toString(),
      aggregateType: 'Curriculum',
      occurredAt: new Date(),
      payload: { curriculumId: curriculum.id.toString(), name: curriculum.name, version: curriculum.curriculumVersion },
      orgId: data.orgId,
      version: 1,
    });

    await this.curriculumRepo.save(curriculum);
    return ok(curriculum);
  }

  async mapCompetencyToCurriculum(data: MapCompetencyData): Promise<Result<CurriculumMapping>> {
    if (!data.curriculumId) {
      return err(new ValidationError('Curriculum ID is required'));
    }
    if (!data.courseId) {
      return err(new ValidationError('Course ID is required'));
    }
    if (!data.competencyId) {
      return err(new ValidationError('Competency ID is required'));
    }
    if (data.proficiencyTarget < 0 || data.proficiencyTarget > 100) {
      return err(new ValidationError('Proficiency target must be between 0 and 100'));
    }

    const curriculum = await this.curriculumRepo.findEntityById(data.curriculumId);
    if (!curriculum) {
      return err(new NotFoundError('Curriculum', data.curriculumId));
    }

    const courseExists = curriculum.courses.find((c) => c.courseId === data.courseId);
    if (!courseExists) {
      return err(new ValidationError(`Course '${data.courseId}' not found in curriculum`));
    }

    const mapping = new CurriculumMapping({
      id: EntityId.create(),
      curriculumId: data.curriculumId,
      courseId: data.courseId,
      competencyId: data.competencyId,
      proficiencyTarget: data.proficiencyTarget,
      mappingType: data.mappingType,
      semester: data.semester,
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mapping.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'CompetencyMappedToCurriculum',
      aggregateId: mapping.id.toString(),
      aggregateType: 'CurriculumMapping',
      occurredAt: new Date(),
      payload: {
        mappingId: mapping.id.toString(),
        curriculumId: data.curriculumId,
        courseId: data.courseId,
        competencyId: data.competencyId,
        proficiencyTarget: data.proficiencyTarget,
      },
      orgId: data.orgId,
      version: 1,
    });

    await this.curriculumMappingRepo.save(mapping);
    return ok(mapping);
  }

  async listCohorts(institutionId: string): Promise<Result<Cohort[]>> {
    const cohorts = await this.cohortRepo.findByInstitution(institutionId);
    return ok(cohorts);
  }

  async createCohort(data: CreateCohortData): Promise<Result<Cohort>> {
    if (!data.name || !data.name.trim()) {
      return err(new ValidationError('Cohort name is required'));
    }
    if (!data.code || !data.code.trim()) {
      return err(new ValidationError('Cohort code is required'));
    }
    if (!data.academicYear || !data.academicYear.trim()) {
      return err(new ValidationError('Academic year is required'));
    }
    if (!data.startDate) {
      return err(new ValidationError('Start date is required'));
    }
    if (!data.institutionId) {
      return err(new ValidationError('Institution ID is required'));
    }
    if (!data.programId) {
      return err(new ValidationError('Program ID is required'));
    }

    const program = await this.programRepo.findEntityById(data.programId);
    if (!program) {
      return err(new NotFoundError('Program', data.programId));
    }

    const existing = await this.cohortRepo.findByCode(data.institutionId, data.code);
    if (existing) {
      return err(new ConflictError(`Cohort with code '${data.code}' already exists in this institution`));
    }

    const cohort = new Cohort({
      id: EntityId.create(),
      institutionId: data.institutionId,
      programId: data.programId,
      name: data.name.trim(),
      code: data.code.trim(),
      academicYear: data.academicYear.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      expectedGraduation: data.expectedGraduation,
      maxStudents: data.maxStudents,
      currentEnrollment: 0,
      status: 'active',
      orgId: data.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    cohort.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'CohortCreated',
      aggregateId: cohort.id.toString(),
      aggregateType: 'Cohort',
      occurredAt: new Date(),
      payload: { cohortId: cohort.id.toString(), institutionId: data.institutionId, name: cohort.name },
      orgId: data.orgId,
      version: 1,
    });

    await this.cohortRepo.save(cohort);
    return ok(cohort);
  }
}
