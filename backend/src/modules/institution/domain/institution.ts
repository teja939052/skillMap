import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError, ValidationError } from '../../../shared/domain/result.js';

export type InstitutionType = 'university' | 'college' | 'institute' | 'training_center' | 'school';
export type InstitutionStatus = 'active' | 'inactive' | 'suspended';

export interface InstitutionProps {
  id: EntityId;
  name: string;
  slug: string;
  type: InstitutionType;
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
  status: InstitutionStatus;
  orgId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class Institution extends AggregateRoot<EntityId> {
  readonly name: string;
  readonly slug: string;
  readonly type: InstitutionType;
  readonly description?: string;
  readonly website?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: InstitutionProps['address'];
  readonly accreditation: string[];
  readonly logoUrl?: string;
  readonly establishedYear?: number;
  private _status: InstitutionStatus;
  readonly orgId: string;
  readonly metadata?: Record<string, unknown>;

  constructor(props: InstitutionProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.slug = props.slug;
    this.type = props.type;
    this.description = props.description;
    this.website = props.website;
    this.email = props.email;
    this.phone = props.phone;
    this.address = props.address;
    this.accreditation = props.accreditation ?? [];
    this.logoUrl = props.logoUrl;
    this.establishedYear = props.establishedYear;
    this._status = props.status;
    this.orgId = props.orgId;
    this.metadata = props.metadata;
  }

  get status(): InstitutionStatus {
    return this._status;
  }

  update(updates: Partial<Pick<InstitutionProps, 'name' | 'description' | 'website' | 'email' | 'phone' | 'address' | 'accreditation' | 'logoUrl' | 'establishedYear' | 'metadata'>>): Result<void> {
    if (updates.name !== undefined) (this as any).name = updates.name;
    if (updates.description !== undefined) (this as any).description = updates.description;
    if (updates.website !== undefined) (this as any).website = updates.website;
    if (updates.email !== undefined) (this as any).email = updates.email;
    if (updates.phone !== undefined) (this as any).phone = updates.phone;
    if (updates.address !== undefined) (this as any).address = updates.address;
    if (updates.accreditation !== undefined) (this as any).accreditation = updates.accreditation;
    if (updates.logoUrl !== undefined) (this as any).logoUrl = updates.logoUrl;
    if (updates.establishedYear !== undefined) (this as any).establishedYear = updates.establishedYear;
    if (updates.metadata !== undefined) (this as any).metadata = updates.metadata;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'InstitutionUpdated',
        aggregateId: this.id.toString(),
        aggregateType: 'Institution',
        payload: { institutionId: this.id.toString(), updates },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  activate(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Institution is already active'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'InstitutionActivated',
        aggregateId: this.id.toString(),
        aggregateType: 'Institution',
        payload: { institutionId: this.id.toString(), name: this.name },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  deactivate(): Result<void> {
    if (this._status === 'inactive') {
      return err(new InvariantError('Institution is already inactive'));
    }
    this._status = 'inactive';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'InstitutionDeactivated',
        aggregateId: this.id.toString(),
        aggregateType: 'Institution',
        payload: { institutionId: this.id.toString(), name: this.name },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  suspend(): Result<void> {
    if (this._status === 'suspended') {
      return err(new InvariantError('Institution is already suspended'));
    }
    this._status = 'suspended';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'InstitutionSuspended',
        aggregateId: this.id.toString(),
        aggregateType: 'Institution',
        payload: { institutionId: this.id.toString(), name: this.name },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  isActive(): boolean {
    return this._status === 'active';
  }
}

export type DepartmentStatus = 'active' | 'inactive';

export interface DepartmentProps {
  id: EntityId;
  institutionId: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  email?: string;
  phone?: string;
  status: DepartmentStatus;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Department extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  private _headOfDepartment?: string;
  readonly email?: string;
  readonly phone?: string;
  private _status: DepartmentStatus;
  readonly orgId: string;

  constructor(props: DepartmentProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.institutionId = props.institutionId;
    this.name = props.name;
    this.code = props.code;
    this.description = props.description;
    this._headOfDepartment = props.headOfDepartment;
    this.email = props.email;
    this.phone = props.phone;
    this._status = props.status;
    this.orgId = props.orgId;
  }

  get status(): DepartmentStatus {
    return this._status;
  }

  get headOfDepartment(): string | undefined {
    return this._headOfDepartment;
  }

  assignHead(userId: string): Result<void> {
    if (!userId) {
      return err(new ValidationError('Head of department user ID is required'));
    }
    const previousHead = this._headOfDepartment;
    this._headOfDepartment = userId;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'DepartmentHeadAssigned',
        aggregateId: this.id.toString(),
        aggregateType: 'Department',
        payload: { departmentId: this.id.toString(), institutionId: this.institutionId, previousHead, newHead: userId },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  update(updates: Partial<Pick<DepartmentProps, 'name' | 'code' | 'description' | 'email' | 'phone'>>): void {
    if (updates.name !== undefined) (this as any).name = updates.name;
    if (updates.code !== undefined) (this as any).code = updates.code;
    if (updates.description !== undefined) (this as any).description = updates.description;
    if (updates.email !== undefined) (this as any).email = updates.email;
    if (updates.phone !== undefined) (this as any).phone = updates.phone;
    this.updatedAt = new Date();
  }

  activate(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Department is already active'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    return ok(undefined);
  }

  deactivate(): Result<void> {
    if (this._status === 'inactive') {
      return err(new InvariantError('Department is already inactive'));
    }
    this._status = 'inactive';
    this.updatedAt = new Date();
    return ok(undefined);
  }
}

export type ProgramType = 'bachelors' | 'masters' | 'doctorate' | 'diploma' | 'certificate' | 'phd' | 'postgraduate';
export type ProgramStatus = 'active' | 'inactive' | 'discontinued';

export interface ProgramProps {
  id: EntityId;
  institutionId: string;
  departmentId?: string;
  name: string;
  code: string;
  type: ProgramType;
  description?: string;
  duration: number;
  durationUnit: 'years' | 'months' | 'weeks' | 'semesters';
  totalCredits?: number;
  eligibility?: string[];
  outcomes?: string[];
  status: ProgramStatus;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Program extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly departmentId?: string;
  readonly name: string;
  readonly code: string;
  readonly type: ProgramType;
  readonly description?: string;
  readonly duration: number;
  readonly durationUnit: ProgramProps['durationUnit'];
  readonly totalCredits?: number;
  readonly eligibility: string[];
  readonly outcomes: string[];
  private _status: ProgramStatus;
  readonly orgId: string;

  constructor(props: ProgramProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.institutionId = props.institutionId;
    this.departmentId = props.departmentId;
    this.name = props.name;
    this.code = props.code;
    this.type = props.type;
    this.description = props.description;
    this.duration = props.duration;
    this.durationUnit = props.durationUnit;
    this.totalCredits = props.totalCredits;
    this.eligibility = props.eligibility ?? [];
    this.outcomes = props.outcomes ?? [];
    this._status = props.status;
    this.orgId = props.orgId;
  }

  get status(): ProgramStatus {
    return this._status;
  }

  update(updates: Partial<Pick<ProgramProps, 'name' | 'code' | 'type' | 'description' | 'duration' | 'durationUnit' | 'totalCredits' | 'eligibility' | 'outcomes'>>): void {
    if (updates.name !== undefined) (this as any).name = updates.name;
    if (updates.code !== undefined) (this as any).code = updates.code;
    if (updates.type !== undefined) (this as any).type = updates.type;
    if (updates.description !== undefined) (this as any).description = updates.description;
    if (updates.duration !== undefined) (this as any).duration = updates.duration;
    if (updates.durationUnit !== undefined) (this as any).durationUnit = updates.durationUnit;
    if (updates.totalCredits !== undefined) (this as any).totalCredits = updates.totalCredits;
    if (updates.eligibility !== undefined) (this as any).eligibility = updates.eligibility;
    if (updates.outcomes !== undefined) (this as any).outcomes = updates.outcomes;
    this.updatedAt = new Date();
  }

  activate(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Program is already active'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ProgramActivated',
        aggregateId: this.id.toString(),
        aggregateType: 'Program',
        payload: { programId: this.id.toString(), institutionId: this.institutionId, name: this.name },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  discontinue(): Result<void> {
    if (this._status === 'discontinued') {
      return err(new InvariantError('Program is already discontinued'));
    }
    this._status = 'discontinued';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ProgramDiscontinued',
        aggregateId: this.id.toString(),
        aggregateType: 'Program',
        payload: { programId: this.id.toString(), institutionId: this.institutionId, name: this.name },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }
}

export type CurriculumStatus = 'draft' | 'active' | 'archived';

export interface CurriculumCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semester: number;
  isCore: boolean;
  prerequisites?: string[];
  description?: string;
}

export interface CurriculumProps {
  id: EntityId;
  institutionId: string;
  programId: string;
  name: string;
  version: string;
  description?: string;
  totalCredits: number;
  totalSemesters: number;
  courses: CurriculumCourse[];
  status: CurriculumStatus;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Curriculum extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly programId: string;
  readonly name: string;
  private _curriculumVersion: string;
  readonly description?: string;
  private _totalCredits: number;
  private _totalSemesters: number;
  private _courses: CurriculumCourse[];
  private _status: CurriculumStatus;
  readonly effectiveFrom?: Date;
  readonly effectiveTo?: Date;
  readonly orgId: string;

  constructor(props: CurriculumProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.institutionId = props.institutionId;
    this.programId = props.programId;
    this.name = props.name;
    this._curriculumVersion = props.version;
    this.description = props.description;
    this._totalCredits = props.totalCredits;
    this._totalSemesters = props.totalSemesters;
    this._courses = props.courses;
    this._status = props.status;
    this.effectiveFrom = props.effectiveFrom;
    this.effectiveTo = props.effectiveTo;
    this.orgId = props.orgId;
  }

  get curriculumVersion(): string {
    return this._curriculumVersion;
  }

  get totalCredits(): number {
    return this._totalCredits;
  }

  get totalSemesters(): number {
    return this._totalSemesters;
  }

  get courses(): ReadonlyArray<CurriculumCourse> {
    return this._courses;
  }

  get status(): CurriculumStatus {
    return this._status;
  }

  addCourse(course: CurriculumCourse): Result<void> {
    const exists = this._courses.find((c) => c.courseId === course.courseId);
    if (exists) {
      return err(new InvariantError(`Course ${course.courseId} already exists in curriculum`));
    }
    this._courses = [...this._courses, course];
    this._totalCredits += course.credits;
    if (course.semester > this._totalSemesters) {
      this._totalSemesters = course.semester;
    }
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CurriculumCourseAdded',
        aggregateId: this.id.toString(),
        aggregateType: 'Curriculum',
        payload: { curriculumId: this.id.toString(), courseId: course.courseId, courseName: course.courseName },
        orgId: this.orgId,
        version: this.curriculumVersion as any,
      })
    );
    return ok(undefined);
  }

  removeCourse(courseId: string): Result<void> {
    const course = this._courses.find((c) => c.courseId === courseId);
    if (!course) {
      return err(new InvariantError(`Course ${courseId} not found in curriculum`));
    }
    this._courses = this._courses.filter((c) => c.courseId !== courseId);
    this._totalCredits -= course.credits;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CurriculumCourseRemoved',
        aggregateId: this.id.toString(),
        aggregateType: 'Curriculum',
        payload: { curriculumId: this.id.toString(), courseId },
        orgId: this.orgId,
        version: this.curriculumVersion as any,
      })
    );
    return ok(undefined);
  }

  activate(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Curriculum is already active'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CurriculumActivated',
        aggregateId: this.id.toString(),
        aggregateType: 'Curriculum',
        payload: { curriculumId: this.id.toString(), name: this.name, version: this._curriculumVersion },
        orgId: this.orgId,
        version: this.curriculumVersion as any,
      })
    );
    return ok(undefined);
  }

  archive(): Result<void> {
    if (this._status === 'archived') {
      return err(new InvariantError('Curriculum is already archived'));
    }
    this._status = 'archived';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CurriculumArchived',
        aggregateId: this.id.toString(),
        aggregateType: 'Curriculum',
        payload: { curriculumId: this.id.toString(), name: this.name, version: this._curriculumVersion },
        orgId: this.orgId,
        version: this.curriculumVersion as any,
      })
    );
    return ok(undefined);
  }
}

export interface CurriculumMappingProps {
  id: EntityId;
  curriculumId: string;
  courseId: string;
  competencyId: string;
  proficiencyTarget: number;
  mappingType: 'primary' | 'secondary' | 'supplementary';
  semester?: number;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CurriculumMapping extends AggregateRoot<EntityId> {
  readonly curriculumId: string;
  readonly courseId: string;
  readonly competencyId: string;
  private _proficiencyTarget: number;
  private _mappingType: 'primary' | 'secondary' | 'supplementary';
  readonly semester?: number;
  readonly orgId: string;

  constructor(props: CurriculumMappingProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.curriculumId = props.curriculumId;
    this.courseId = props.courseId;
    this.competencyId = props.competencyId;
    this._proficiencyTarget = props.proficiencyTarget;
    this._mappingType = props.mappingType;
    this.semester = props.semester;
    this.orgId = props.orgId;
  }

  get proficiencyTarget(): number {
    return this._proficiencyTarget;
  }

  get mappingType(): string {
    return this._mappingType;
  }

  updateProficiencyTarget(target: number): Result<void> {
    if (target < 0 || target > 100) {
      return err(new ValidationError('Proficiency target must be between 0 and 100'));
    }
    const oldTarget = this._proficiencyTarget;
    this._proficiencyTarget = target;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CurriculumMappingUpdated',
        aggregateId: this.id.toString(),
        aggregateType: 'CurriculumMapping',
        payload: { mappingId: this.id.toString(), competencyId: this.competencyId, oldTarget, newTarget: target },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  setMappingType(type: 'primary' | 'secondary' | 'supplementary'): void {
    this._mappingType = type;
    this.updatedAt = new Date();
  }
}

export type CohortStatus = 'active' | 'completed' | 'archived';

export interface CohortProps {
  id: EntityId;
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
  status: CohortStatus;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Cohort extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly programId: string;
  readonly name: string;
  readonly code: string;
  readonly academicYear: string;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly expectedGraduation?: Date;
  readonly maxStudents?: number;
  private _currentEnrollment: number;
  private _status: CohortStatus;
  readonly orgId: string;

  constructor(props: CohortProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.institutionId = props.institutionId;
    this.programId = props.programId;
    this.name = props.name;
    this.code = props.code;
    this.academicYear = props.academicYear;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.expectedGraduation = props.expectedGraduation;
    this.maxStudents = props.maxStudents;
    this._currentEnrollment = props.currentEnrollment;
    this._status = props.status;
    this.orgId = props.orgId;
  }

  get currentEnrollment(): number {
    return this._currentEnrollment;
  }

  get status(): CohortStatus {
    return this._status;
  }

  enrollStudent(): Result<void> {
    if (this.maxStudents && this._currentEnrollment >= this.maxStudents) {
      return err(new InvariantError('Cohort is at maximum capacity'));
    }
    this._currentEnrollment += 1;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CohortStudentEnrolled',
        aggregateId: this.id.toString(),
        aggregateType: 'Cohort',
        payload: { cohortId: this.id.toString(), institutionId: this.institutionId, currentEnrollment: this._currentEnrollment },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  removeStudent(): Result<void> {
    if (this._currentEnrollment <= 0) {
      return err(new InvariantError('No students to remove'));
    }
    this._currentEnrollment -= 1;
    this.updatedAt = new Date();
    return ok(undefined);
  }

  complete(): Result<void> {
    if (this._status === 'completed') {
      return err(new InvariantError('Cohort is already completed'));
    }
    this._status = 'completed';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'CohortCompleted',
        aggregateId: this.id.toString(),
        aggregateType: 'Cohort',
        payload: { cohortId: this.id.toString(), institutionId: this.institutionId, name: this.name },
        orgId: this.orgId,
        version: this.version,
      })
    );
    return ok(undefined);
  }

  archive(): Result<void> {
    if (this._status === 'archived') {
      return err(new InvariantError('Cohort is already archived'));
    }
    this._status = 'archived';
    this.updatedAt = new Date();
    return ok(undefined);
  }
}
