import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, InvariantError, ValidationError } from '../../../shared/domain/result.js';

export type FacultyTitle =
  | 'Professor'
  | 'Associate Professor'
  | 'Assistant Professor'
  | 'Lecturer'
  | 'Visiting Faculty'
  | 'Adjunct Faculty'
  | 'Research Fellow';

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';
export type FacultyStatus = 'active' | 'inactive';

export interface ExpertiseEntry {
  competencyId: string;
  level: number;
  yearsOfExperience: number;
}

export interface IndustryExposureEntry {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

export interface FacultyProfileProps {
  id: EntityId;
  userId: string;
  institutionId: string;
  departmentId?: string;
  title: FacultyTitle;
  bio?: string;
  researchInterests: string[];
  expertise: ExpertiseEntry[];
  industryExposure: IndustryExposureEntry[];
  availability: AvailabilityStatus;
  status: FacultyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class FacultyProfile extends AggregateRoot<EntityId> {
  readonly userId: string;
  readonly institutionId: string;
  readonly departmentId?: string;
  readonly title: FacultyTitle;
  readonly bio?: string;
  private _researchInterests: string[];
  private _expertise: ExpertiseEntry[];
  private _industryExposure: IndustryExposureEntry[];
  private _availability: AvailabilityStatus;
  private _status: FacultyStatus;

  constructor(props: FacultyProfileProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.userId = props.userId;
    this.institutionId = props.institutionId;
    this.departmentId = props.departmentId;
    this.title = props.title;
    this.bio = props.bio;
    this._researchInterests = props.researchInterests ?? [];
    this._expertise = props.expertise ?? [];
    this._industryExposure = props.industryExposure ?? [];
    this._availability = props.availability;
    this._status = props.status;
  }

  get researchInterests(): ReadonlyArray<string> {
    return this._researchInterests;
  }

  get expertise(): ReadonlyArray<ExpertiseEntry> {
    return this._expertise;
  }

  get industryExposure(): ReadonlyArray<IndustryExposureEntry> {
    return this._industryExposure;
  }

  get availability(): AvailabilityStatus {
    return this._availability;
  }

  get status(): FacultyStatus {
    return this._status;
  }

  addExpertise(entry: ExpertiseEntry): Result<void> {
    if (entry.level < 0 || entry.level > 100) {
      return err(new ValidationError('Expertise level must be between 0 and 100'));
    }
    if (entry.yearsOfExperience < 0) {
      return err(new ValidationError('Years of experience cannot be negative'));
    }
    const existing = this._expertise.find((e) => e.competencyId === entry.competencyId);
    if (existing) {
      return err(new InvariantError(`Expertise for competency '${entry.competencyId}' already exists`));
    }
    this._expertise = [...this._expertise, entry];
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FacultyExpertiseAdded',
        aggregateId: this.id.toString(),
        aggregateType: 'FacultyProfile',
        payload: { facultyId: this.id.toString(), userId: this.userId, competencyId: entry.competencyId, level: entry.level },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addIndustryExposure(entry: IndustryExposureEntry): Result<void> {
    if (!entry.company || !entry.company.trim()) {
      return err(new ValidationError('Company name is required'));
    }
    if (!entry.role || !entry.role.trim()) {
      return err(new ValidationError('Role is required'));
    }
    this._industryExposure = [...this._industryExposure, entry];
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FacultyIndustryExposureAdded',
        aggregateId: this.id.toString(),
        aggregateType: 'FacultyProfile',
        payload: { facultyId: this.id.toString(), userId: this.userId, company: entry.company, role: entry.role },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  updateAvailability(availability: AvailabilityStatus): Result<void> {
    if (this._availability === availability) {
      return err(new InvariantError(`Availability is already '${availability}'`));
    }
    const previous = this._availability;
    this._availability = availability;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FacultyAvailabilityUpdated',
        aggregateId: this.id.toString(),
        aggregateType: 'FacultyProfile',
        payload: { facultyId: this.id.toString(), userId: this.userId, previous, current: availability },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addResearchInterest(interest: string): void {
    if (!this._researchInterests.includes(interest)) {
      this._researchInterests = [...this._researchInterests, interest];
      this.updatedAt = new Date();
    }
  }

  activate(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Faculty profile is already active'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FacultyProfileActivated',
        aggregateId: this.id.toString(),
        aggregateType: 'FacultyProfile',
        payload: { facultyId: this.id.toString(), userId: this.userId },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  deactivate(): Result<void> {
    if (this._status === 'inactive') {
      return err(new InvariantError('Faculty profile is already inactive'));
    }
    this._status = 'inactive';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FacultyProfileDeactivated',
        aggregateId: this.id.toString(),
        aggregateType: 'FacultyProfile',
        payload: { facultyId: this.id.toString(), userId: this.userId },
        version: this.version,
      })
    );
    return ok(undefined);
  }
}

export type ResearchProjectStatus = 'proposed' | 'active' | 'completed';

export interface ResearchProjectProps {
  id: EntityId;
  facultyId: string;
  title: string;
  description?: string;
  status: ResearchProjectStatus;
  competencyIds: string[];
  collaboratorIds: string[];
  seekingCollaboration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ResearchProject extends AggregateRoot<EntityId> {
  readonly facultyId: string;
  readonly title: string;
  readonly description?: string;
  private _status: ResearchProjectStatus;
  private _competencyIds: string[];
  private _collaboratorIds: string[];
  private _seekingCollaboration: boolean;

  constructor(props: ResearchProjectProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.facultyId = props.facultyId;
    this.title = props.title;
    this.description = props.description;
    this._status = props.status;
    this._competencyIds = props.competencyIds ?? [];
    this._collaboratorIds = props.collaboratorIds ?? [];
    this._seekingCollaboration = props.seekingCollaboration;
  }

  get status(): ResearchProjectStatus {
    return this._status;
  }

  get competencyIds(): ReadonlyArray<string> {
    return this._competencyIds;
  }

  get collaboratorIds(): ReadonlyArray<string> {
    return this._collaboratorIds;
  }

  get seekingCollaboration(): boolean {
    return this._seekingCollaboration;
  }

  start(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Research project is already active'));
    }
    if (this._status === 'completed') {
      return err(new InvariantError('Cannot start a completed research project'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ResearchProjectStarted',
        aggregateId: this.id.toString(),
        aggregateType: 'ResearchProject',
        payload: { projectId: this.id.toString(), facultyId: this.facultyId, title: this.title },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  complete(): Result<void> {
    if (this._status === 'completed') {
      return err(new InvariantError('Research project is already completed'));
    }
    this._status = 'completed';
    this._seekingCollaboration = false;
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ResearchProjectCompleted',
        aggregateId: this.id.toString(),
        aggregateType: 'ResearchProject',
        payload: { projectId: this.id.toString(), facultyId: this.facultyId, title: this.title },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addCollaborator(collaboratorId: string): Result<void> {
    if (this._collaboratorIds.includes(collaboratorId)) {
      return err(new InvariantError('Collaborator already exists on this project'));
    }
    this._collaboratorIds = [...this._collaboratorIds, collaboratorId];
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ResearchProjectCollaboratorAdded',
        aggregateId: this.id.toString(),
        aggregateType: 'ResearchProject',
        payload: { projectId: this.id.toString(), facultyId: this.facultyId, collaboratorId },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  setSeekingCollaboration(seeking: boolean): void {
    this._seekingCollaboration = seeking;
    this.updatedAt = new Date();
  }

  addCompetency(competencyId: string): void {
    if (!this._competencyIds.includes(competencyId)) {
      this._competencyIds = [...this._competencyIds, competencyId];
      this.updatedAt = new Date();
    }
  }
}

export type MentorshipStatus = 'requested' | 'active' | 'completed' | 'cancelled';

export interface MentorshipProps {
  id: EntityId;
  facultyId: string;
  studentId: string;
  status: MentorshipStatus;
  topic: string;
  competencyIds: string[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Mentorship extends AggregateRoot<EntityId> {
  readonly facultyId: string;
  readonly studentId: string;
  private _status: MentorshipStatus;
  readonly topic: string;
  private _competencyIds: string[];
  readonly startDate: Date;
  private _endDate?: Date;

  constructor(props: MentorshipProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.facultyId = props.facultyId;
    this.studentId = props.studentId;
    this._status = props.status;
    this.topic = props.topic;
    this._competencyIds = props.competencyIds ?? [];
    this.startDate = props.startDate;
    this._endDate = props.endDate;
  }

  get status(): MentorshipStatus {
    return this._status;
  }

  get competencyIds(): ReadonlyArray<string> {
    return this._competencyIds;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  accept(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Mentorship is already active'));
    }
    if (this._status === 'completed') {
      return err(new InvariantError('Cannot accept a completed mentorship'));
    }
    if (this._status === 'cancelled') {
      return err(new InvariantError('Cannot accept a cancelled mentorship'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'MentorshipAccepted',
        aggregateId: this.id.toString(),
        aggregateType: 'Mentorship',
        payload: { mentorshipId: this.id.toString(), facultyId: this.facultyId, studentId: this.studentId, topic: this.topic },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  complete(): Result<void> {
    if (this._status === 'completed') {
      return err(new InvariantError('Mentorship is already completed'));
    }
    if (this._status === 'cancelled') {
      return err(new InvariantError('Cannot complete a cancelled mentorship'));
    }
    this._status = 'completed';
    this._endDate = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'MentorshipCompleted',
        aggregateId: this.id.toString(),
        aggregateType: 'Mentorship',
        payload: { mentorshipId: this.id.toString(), facultyId: this.facultyId, studentId: this.studentId, topic: this.topic },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  cancel(): Result<void> {
    if (this._status === 'cancelled') {
      return err(new InvariantError('Mentorship is already cancelled'));
    }
    if (this._status === 'completed') {
      return err(new InvariantError('Cannot cancel a completed mentorship'));
    }
    this._status = 'cancelled';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'MentorshipCancelled',
        aggregateId: this.id.toString(),
        aggregateType: 'Mentorship',
        payload: { mentorshipId: this.id.toString(), facultyId: this.facultyId, studentId: this.studentId, topic: this.topic },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addCompetency(competencyId: string): void {
    if (!this._competencyIds.includes(competencyId)) {
      this._competencyIds = [...this._competencyIds, competencyId];
      this.updatedAt = new Date();
    }
  }
}

export type ConsultancyStatus = 'proposed' | 'active' | 'completed';

export interface ConsultancyProjectProps {
  id: EntityId;
  facultyId: string;
  companyId: string;
  title: string;
  description?: string;
  status: ConsultancyStatus;
  competencyIds: string[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ConsultancyProject extends AggregateRoot<EntityId> {
  readonly facultyId: string;
  readonly companyId: string;
  readonly title: string;
  readonly description?: string;
  private _status: ConsultancyStatus;
  private _competencyIds: string[];
  readonly startDate: Date;
  private _endDate?: Date;

  constructor(props: ConsultancyProjectProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.facultyId = props.facultyId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.description = props.description;
    this._status = props.status;
    this._competencyIds = props.competencyIds ?? [];
    this.startDate = props.startDate;
    this._endDate = props.endDate;
  }

  get status(): ConsultancyStatus {
    return this._status;
  }

  get competencyIds(): ReadonlyArray<string> {
    return this._competencyIds;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  start(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('Consultancy project is already active'));
    }
    if (this._status === 'completed') {
      return err(new InvariantError('Cannot start a completed consultancy project'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ConsultancyProjectStarted',
        aggregateId: this.id.toString(),
        aggregateType: 'ConsultancyProject',
        payload: { projectId: this.id.toString(), facultyId: this.facultyId, companyId: this.companyId, title: this.title },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  complete(): Result<void> {
    if (this._status === 'completed') {
      return err(new InvariantError('Consultancy project is already completed'));
    }
    this._status = 'completed';
    this._endDate = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'ConsultancyProjectCompleted',
        aggregateId: this.id.toString(),
        aggregateType: 'ConsultancyProject',
        payload: { projectId: this.id.toString(), facultyId: this.facultyId, companyId: this.companyId, title: this.title },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addCompetency(competencyId: string): void {
    if (!this._competencyIds.includes(competencyId)) {
      this._competencyIds = [...this._competencyIds, competencyId];
      this.updatedAt = new Date();
    }
  }
}

export type FDPType = 'workshop' | 'seminar' | 'training' | 'conference';
export type FDPStatus = 'upcoming' | 'ongoing' | 'completed';

export interface FDPProps {
  id: EntityId;
  title: string;
  description?: string;
  organizer: string;
  facultyIds: string[];
  type: FDPType;
  startDate: Date;
  endDate: Date;
  status: FDPStatus;
  competencyIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class FDP extends AggregateRoot<EntityId> {
  readonly title: string;
  readonly description?: string;
  readonly organizer: string;
  private _facultyIds: string[];
  readonly type: FDPType;
  readonly startDate: Date;
  readonly endDate: Date;
  private _status: FDPStatus;
  private _competencyIds: string[];

  constructor(props: FDPProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.title = props.title;
    this.description = props.description;
    this.organizer = props.organizer;
    this._facultyIds = props.facultyIds ?? [];
    this.type = props.type;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this._status = props.status;
    this._competencyIds = props.competencyIds ?? [];
  }

  get facultyIds(): ReadonlyArray<string> {
    return this._facultyIds;
  }

  get status(): FDPStatus {
    return this._status;
  }

  get competencyIds(): ReadonlyArray<string> {
    return this._competencyIds;
  }

  enrollFaculty(facultyId: string): Result<void> {
    if (this._facultyIds.includes(facultyId)) {
      return err(new InvariantError('Faculty is already enrolled in this FDP'));
    }
    this._facultyIds = [...this._facultyIds, facultyId];
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FDPFacultyEnrolled',
        aggregateId: this.id.toString(),
        aggregateType: 'FDP',
        payload: { fdpId: this.id.toString(), facultyId, title: this.title },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  start(): Result<void> {
    if (this._status === 'ongoing') {
      return err(new InvariantError('FDP is already ongoing'));
    }
    if (this._status === 'completed') {
      return err(new InvariantError('Cannot start a completed FDP'));
    }
    this._status = 'ongoing';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FDPStarted',
        aggregateId: this.id.toString(),
        aggregateType: 'FDP',
        payload: { fdpId: this.id.toString(), title: this.title },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  complete(): Result<void> {
    if (this._status === 'completed') {
      return err(new InvariantError('FDP is already completed'));
    }
    this._status = 'completed';
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'FDPCompleted',
        aggregateId: this.id.toString(),
        aggregateType: 'FDP',
        payload: { fdpId: this.id.toString(), title: this.title },
        version: this.version,
      })
    );
    return ok(undefined);
  }

  addCompetency(competencyId: string): void {
    if (!this._competencyIds.includes(competencyId)) {
      this._competencyIds = [...this._competencyIds, competencyId];
      this.updatedAt = new Date();
    }
  }
}
