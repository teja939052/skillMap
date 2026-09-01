import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, NotFoundError, ValidationError, ConflictError } from '../../../shared/domain/result.js';
import {
  FacultyProfile,
  ResearchProject,
  Mentorship,
  ConsultancyProject,
  FDP,
  FacultyTitle,
  ExpertiseEntry,
  IndustryExposureEntry,
  AvailabilityStatus,
  ResearchProjectStatus,
  MentorshipStatus,
  ConsultancyStatus,
  FDPType,
  FDPStatus,
} from '../domain/faculty.js';
import {
  FacultyProfileRepository,
  ResearchProjectRepository,
  MentorshipRepository,
  ConsultancyRepository,
  FDPOfferingRepository,
} from '../infrastructure/repositories.js';

export interface CreateProfileData {
  userId: string;
  institutionId: string;
  departmentId?: string;
  title: FacultyTitle;
  bio?: string;
  researchInterests?: string[];
  expertise?: ExpertiseEntry[];
  industryExposure?: IndustryExposureEntry[];
  availability?: AvailabilityStatus;
  orgId: string;
}

export interface UpdateProfileData {
  title?: FacultyTitle;
  bio?: string;
  departmentId?: string;
  researchInterests?: string[];
  availability?: AvailabilityStatus;
}

export interface CreateResearchProjectData {
  facultyId: string;
  title: string;
  description?: string;
  competencyIds?: string[];
  orgId: string;
}

export interface CreateMentorshipData {
  facultyId: string;
  studentId: string;
  topic: string;
  competencyIds?: string[];
  startDate: Date;
}

export interface CreateConsultancyData {
  facultyId: string;
  companyId: string;
  title: string;
  description?: string;
  competencyIds?: string[];
  startDate: Date;
}

export interface CreateFDPData {
  title: string;
  description?: string;
  organizer: string;
  type: FDPType;
  startDate: Date;
  endDate: Date;
  competencyIds?: string[];
  orgId: string;
}

export class FacultyService {
  constructor(
    private readonly facultyRepo: FacultyProfileRepository,
    private readonly researchRepo: ResearchProjectRepository,
    private readonly mentorshipRepo: MentorshipRepository,
    private readonly consultancyRepo: ConsultancyRepository,
    private readonly fdpRepo: FDPOfferingRepository,
  ) {}

  async createProfile(data: CreateProfileData, userId: string): Promise<Result<FacultyProfile>> {
    if (!data.userId) {
      return err(new ValidationError('User ID is required'));
    }
    if (!data.institutionId) {
      return err(new ValidationError('Institution ID is required'));
    }
    if (!data.title) {
      return err(new ValidationError('Faculty title is required'));
    }

    const existing = await this.facultyRepo.findByUserId(data.userId);
    if (existing) {
      return err(new ConflictError(`Faculty profile already exists for user '${data.userId}'`));
    }

    const profile = new FacultyProfile({
      id: EntityId.create(),
      userId: data.userId,
      institutionId: data.institutionId,
      departmentId: data.departmentId,
      title: data.title,
      bio: data.bio,
      researchInterests: data.researchInterests ?? [],
      expertise: data.expertise ?? [],
      industryExposure: data.industryExposure ?? [],
      availability: data.availability ?? 'available',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    profile.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'FacultyProfileCreated',
      aggregateId: profile.id.toString(),
      aggregateType: 'FacultyProfile',
      occurredAt: new Date(),
      payload: { facultyId: profile.id.toString(), userId: data.userId, title: data.title },
      orgId: data.orgId,
      actorId: userId,
      version: 1,
    });

    await this.facultyRepo.save(profile);
    return ok(profile);
  }

  async getProfile(userId: string): Promise<Result<FacultyProfile>> {
    const profile = await this.facultyRepo.findByUserId(userId);
    if (!profile) {
      return err(new NotFoundError('FacultyProfile', userId));
    }
    return ok(profile);
  }

  async updateProfile(userId: string, updates: UpdateProfileData, actorId: string): Promise<Result<FacultyProfile>> {
    const profile = await this.facultyRepo.findByUserId(userId);
    if (!profile) {
      return err(new NotFoundError('FacultyProfile', userId));
    }

    if (updates.title !== undefined) (profile as any).title = updates.title;
    if (updates.bio !== undefined) (profile as any).bio = updates.bio;
    if (updates.departmentId !== undefined) (profile as any).departmentId = updates.departmentId;
    if (updates.researchInterests !== undefined) {
      (profile as any)._researchInterests = updates.researchInterests;
    }
    if (updates.availability !== undefined) {
      const result = profile.updateAvailability(updates.availability);
      if (!result.success) return result;
    }

    profile.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'FacultyProfileUpdated',
      aggregateId: profile.id.toString(),
      aggregateType: 'FacultyProfile',
      occurredAt: new Date(),
      payload: { facultyId: profile.id.toString(), userId, updates },
      actorId,
      version: profile.version,
    });

    await this.facultyRepo.save(profile);
    return ok(profile);
  }

  async addExpertise(facultyId: string, expertise: ExpertiseEntry): Promise<Result<FacultyProfile>> {
    const profile = await this.facultyRepo.findEntityById(facultyId);
    if (!profile) {
      return err(new NotFoundError('FacultyProfile', facultyId));
    }

    const result = profile.addExpertise(expertise);
    if (!result.success) return result as Result<FacultyProfile>;

    await this.facultyRepo.save(profile);
    return ok(profile);
  }

  async searchByExpertise(competencyId: string): Promise<Result<FacultyProfile[]>> {
    if (!competencyId) {
      return err(new ValidationError('Competency ID is required'));
    }
    const profiles = await this.facultyRepo.findByCompetency(competencyId);
    return ok(profiles);
  }

  async getAvailability(facultyId: string): Promise<Result<AvailabilityStatus>> {
    const profile = await this.facultyRepo.findEntityById(facultyId);
    if (!profile) {
      return err(new NotFoundError('FacultyProfile', facultyId));
    }
    return ok(profile.availability);
  }

  async createResearchProject(data: CreateResearchProjectData): Promise<Result<ResearchProject>> {
    if (!data.facultyId) {
      return err(new ValidationError('Faculty ID is required'));
    }
    if (!data.title || !data.title.trim()) {
      return err(new ValidationError('Research project title is required'));
    }

    const project = new ResearchProject({
      id: EntityId.create(),
      facultyId: data.facultyId,
      title: data.title.trim(),
      description: data.description,
      status: 'proposed',
      competencyIds: data.competencyIds ?? [],
      collaboratorIds: [],
      seekingCollaboration: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    project.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'ResearchProjectCreated',
      aggregateId: project.id.toString(),
      aggregateType: 'ResearchProject',
      occurredAt: new Date(),
      payload: { projectId: project.id.toString(), facultyId: data.facultyId, title: project.title },
      orgId: data.orgId,
      version: 1,
    });

    await this.researchRepo.save(project);
    return ok(project);
  }

  async seekCollaboration(projectId: string): Promise<Result<ResearchProject>> {
    const project = await this.researchRepo.findEntityById(projectId);
    if (!project) {
      return err(new NotFoundError('ResearchProject', projectId));
    }

    project.setSeekingCollaboration(true);
    await this.researchRepo.save(project);
    return ok(project);
  }

  async createMentorship(data: CreateMentorshipData): Promise<Result<Mentorship>> {
    if (!data.facultyId) {
      return err(new ValidationError('Faculty ID is required'));
    }
    if (!data.studentId) {
      return err(new ValidationError('Student ID is required'));
    }
    if (!data.topic || !data.topic.trim()) {
      return err(new ValidationError('Mentorship topic is required'));
    }

    const mentorship = new Mentorship({
      id: EntityId.create(),
      facultyId: data.facultyId,
      studentId: data.studentId,
      status: 'requested',
      topic: data.topic.trim(),
      competencyIds: data.competencyIds ?? [],
      startDate: data.startDate,
      endDate: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mentorship.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'MentorshipRequested',
      aggregateId: mentorship.id.toString(),
      aggregateType: 'Mentorship',
      occurredAt: new Date(),
      payload: {
        mentorshipId: mentorship.id.toString(),
        facultyId: data.facultyId,
        studentId: data.studentId,
        topic: data.topic,
      },
      version: 1,
    });

    await this.mentorshipRepo.save(mentorship);
    return ok(mentorship);
  }

  async updateMentorshipStatus(mentorshipId: string, status: MentorshipStatus): Promise<Result<Mentorship>> {
    const mentorship = await this.mentorshipRepo.findEntityById(mentorshipId);
    if (!mentorship) {
      return err(new NotFoundError('Mentorship', mentorshipId));
    }

    let result: Result<void>;
    switch (status) {
      case 'active':
        result = mentorship.accept();
        break;
      case 'completed':
        result = mentorship.complete();
        break;
      case 'cancelled':
        result = mentorship.cancel();
        break;
      default:
        return err(new ValidationError(`Invalid status transition to '${status}'`));
    }

    if (!result.success) return result as Result<Mentorship>;

    await this.mentorshipRepo.save(mentorship);
    return ok(mentorship);
  }

  async createConsultancy(data: CreateConsultancyData): Promise<Result<ConsultancyProject>> {
    if (!data.facultyId) {
      return err(new ValidationError('Faculty ID is required'));
    }
    if (!data.companyId) {
      return err(new ValidationError('Company ID is required'));
    }
    if (!data.title || !data.title.trim()) {
      return err(new ValidationError('Consultancy project title is required'));
    }

    const project = new ConsultancyProject({
      id: EntityId.create(),
      facultyId: data.facultyId,
      companyId: data.companyId,
      title: data.title.trim(),
      description: data.description,
      status: 'proposed',
      competencyIds: data.competencyIds ?? [],
      startDate: data.startDate,
      endDate: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    project.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'ConsultancyProjectCreated',
      aggregateId: project.id.toString(),
      aggregateType: 'ConsultancyProject',
      occurredAt: new Date(),
      payload: {
        projectId: project.id.toString(),
        facultyId: data.facultyId,
        companyId: data.companyId,
        title: project.title,
      },
      version: 1,
    });

    await this.consultancyRepo.save(project);
    return ok(project);
  }

  async createFDP(data: CreateFDPData): Promise<Result<FDP>> {
    if (!data.title || !data.title.trim()) {
      return err(new ValidationError('FDP title is required'));
    }
    if (!data.organizer || !data.organizer.trim()) {
      return err(new ValidationError('FDP organizer is required'));
    }
    if (!data.type) {
      return err(new ValidationError('FDP type is required'));
    }
    if (!data.startDate || !data.endDate) {
      return err(new ValidationError('FDP start and end dates are required'));
    }
    if (data.endDate <= data.startDate) {
      return err(new ValidationError('FDP end date must be after start date'));
    }

    const fdp = new FDP({
      id: EntityId.create(),
      title: data.title.trim(),
      description: data.description,
      organizer: data.organizer.trim(),
      facultyIds: [],
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'upcoming',
      competencyIds: data.competencyIds ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    fdp.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'FDPCreated',
      aggregateId: fdp.id.toString(),
      aggregateType: 'FDP',
      occurredAt: new Date(),
      payload: { fdpId: fdp.id.toString(), title: fdp.title, organizer: data.organizer, type: data.type },
      orgId: data.orgId,
      version: 1,
    });

    await this.fdpRepo.save(fdp);
    return ok(fdp);
  }

  async enrollInFDP(fdpId: string, facultyId: string): Promise<Result<FDP>> {
    const fdp = await this.fdpRepo.findEntityById(fdpId);
    if (!fdp) {
      return err(new NotFoundError('FDP', fdpId));
    }

    const result = fdp.enrollFaculty(facultyId);
    if (!result.success) return result as Result<FDP>;

    await this.fdpRepo.save(fdp);
    return ok(fdp);
  }
}
