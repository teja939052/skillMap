import { Repository } from '../../../shared/persistence/repository.js';
import {
  FacultyProfile,
  ResearchProject,
  Mentorship,
  ConsultancyProject,
  FDP,
} from '../domain/faculty.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface FacultyProfileDocument {
  _id: string;
  userId: string;
  institutionId: string;
  departmentId?: string;
  title: string;
  bio?: string;
  researchInterests: string[];
  expertise: Array<{ competencyId: string; level: number; yearsOfExperience: number }>;
  industryExposure: Array<{ company: string; role: string; duration: string; description?: string }>;
  availability: string;
  status: string;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class FacultyProfileRepository extends Repository<FacultyProfileDocument> {
  protected collectionName = 'faculty_profiles';

  async findEntityById(id: string): Promise<FacultyProfile | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<FacultyProfile | null> {
    const doc = await this.findOne({ userId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByInstitution(institutionId: string): Promise<FacultyProfile[]> {
    const docs = await this.find({ institutionId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByDepartment(departmentId: string): Promise<FacultyProfile[]> {
    const docs = await this.find({ departmentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCompetency(competencyId: string): Promise<FacultyProfile[]> {
    const docs = await this.find({ 'expertise.competencyId': competencyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findAvailable(): Promise<FacultyProfile[]> {
    const docs = await this.find({ availability: 'available', status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByOrg(orgId: string): Promise<FacultyProfile[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(profile: FacultyProfile): Promise<void> {
    const doc = this.toDocument(profile);
    await this.collection.updateOne(
      { _id: profile.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: FacultyProfileDocument): FacultyProfile {
    return new FacultyProfile({
      id: EntityId.fromString(doc._id.toString()),
      userId: doc.userId,
      institutionId: doc.institutionId,
      departmentId: doc.departmentId,
      title: doc.title as any,
      bio: doc.bio,
      researchInterests: doc.researchInterests ?? [],
      expertise: doc.expertise ?? [],
      industryExposure: doc.industryExposure ?? [],
      availability: doc.availability as any,
      status: doc.status as any,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(p: FacultyProfile): FacultyProfileDocument {
    return {
      _id: p.id.toString(),
      userId: p.userId,
      institutionId: p.institutionId,
      departmentId: p.departmentId,
      title: p.title,
      bio: p.bio,
      researchInterests: p.researchInterests as string[],
      expertise: p.expertise as any[],
      industryExposure: p.industryExposure as any[],
      availability: p.availability,
      status: p.status,
      orgId: '',
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: null,
    };
  }
}

export interface ResearchProjectDocument {
  _id: string;
  facultyId: string;
  title: string;
  description?: string;
  status: string;
  competencyIds: string[];
  collaboratorIds: string[];
  seekingCollaboration: boolean;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class ResearchProjectRepository extends Repository<ResearchProjectDocument> {
  protected collectionName = 'research_projects';

  async findEntityById(id: string): Promise<ResearchProject | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByFaculty(facultyId: string): Promise<ResearchProject[]> {
    const docs = await this.find({ facultyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCompetency(competencyId: string): Promise<ResearchProject[]> {
    const docs = await this.find({ competencyIds: competencyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findSeekingCollaboration(): Promise<ResearchProject[]> {
    const docs = await this.find({ seekingCollaboration: true, status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByOrg(orgId: string): Promise<ResearchProject[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(project: ResearchProject): Promise<void> {
    const doc = this.toDocument(project);
    await this.collection.updateOne(
      { _id: project.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: ResearchProjectDocument): ResearchProject {
    return new ResearchProject({
      id: EntityId.fromString(doc._id.toString()),
      facultyId: doc.facultyId,
      title: doc.title,
      description: doc.description,
      status: doc.status as any,
      competencyIds: doc.competencyIds ?? [],
      collaboratorIds: doc.collaboratorIds ?? [],
      seekingCollaboration: doc.seekingCollaboration,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(p: ResearchProject): ResearchProjectDocument {
    return {
      _id: p.id.toString(),
      facultyId: p.facultyId,
      title: p.title,
      description: p.description,
      status: p.status,
      competencyIds: p.competencyIds as string[],
      collaboratorIds: p.collaboratorIds as string[],
      seekingCollaboration: p.seekingCollaboration,
      orgId: '',
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: null,
    };
  }
}

export interface MentorshipDocument {
  _id: string;
  facultyId: string;
  studentId: string;
  status: string;
  topic: string;
  competencyIds: string[];
  startDate: Date;
  endDate?: Date;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class MentorshipRepository extends Repository<MentorshipDocument> {
  protected collectionName = 'mentorships';

  async findEntityById(id: string): Promise<Mentorship | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByFaculty(facultyId: string): Promise<Mentorship[]> {
    const docs = await this.find({ facultyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStudent(studentId: string): Promise<Mentorship[]> {
    const docs = await this.find({ studentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByFacultyAndStudent(facultyId: string, studentId: string): Promise<Mentorship[]> {
    const docs = await this.find({ facultyId, studentId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findActiveByFaculty(facultyId: string): Promise<Mentorship[]> {
    const docs = await this.find({ facultyId, status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByOrg(orgId: string): Promise<Mentorship[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(mentorship: Mentorship): Promise<void> {
    const doc = this.toDocument(mentorship);
    await this.collection.updateOne(
      { _id: mentorship.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: MentorshipDocument): Mentorship {
    return new Mentorship({
      id: EntityId.fromString(doc._id.toString()),
      facultyId: doc.facultyId,
      studentId: doc.studentId,
      status: doc.status as any,
      topic: doc.topic,
      competencyIds: doc.competencyIds ?? [],
      startDate: doc.startDate,
      endDate: doc.endDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(m: Mentorship): MentorshipDocument {
    return {
      _id: m.id.toString(),
      facultyId: m.facultyId,
      studentId: m.studentId,
      status: m.status,
      topic: m.topic,
      competencyIds: m.competencyIds as string[],
      startDate: m.startDate,
      endDate: m.endDate,
      orgId: '',
      version: m.version,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: null,
    };
  }
}

export interface ConsultancyDocument {
  _id: string;
  facultyId: string;
  companyId: string;
  title: string;
  description?: string;
  status: string;
  competencyIds: string[];
  startDate: Date;
  endDate?: Date;
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class ConsultancyRepository extends Repository<ConsultancyDocument> {
  protected collectionName = 'consultancy_projects';

  async findEntityById(id: string): Promise<ConsultancyProject | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByFaculty(facultyId: string): Promise<ConsultancyProject[]> {
    const docs = await this.find({ facultyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByCompany(companyId: string): Promise<ConsultancyProject[]> {
    const docs = await this.find({ companyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByOrg(orgId: string): Promise<ConsultancyProject[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(project: ConsultancyProject): Promise<void> {
    const doc = this.toDocument(project);
    await this.collection.updateOne(
      { _id: project.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: ConsultancyDocument): ConsultancyProject {
    return new ConsultancyProject({
      id: EntityId.fromString(doc._id.toString()),
      facultyId: doc.facultyId,
      companyId: doc.companyId,
      title: doc.title,
      description: doc.description,
      status: doc.status as any,
      competencyIds: doc.competencyIds ?? [],
      startDate: doc.startDate,
      endDate: doc.endDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(p: ConsultancyProject): ConsultancyDocument {
    return {
      _id: p.id.toString(),
      facultyId: p.facultyId,
      companyId: p.companyId,
      title: p.title,
      description: p.description,
      status: p.status,
      competencyIds: p.competencyIds as string[],
      startDate: p.startDate,
      endDate: p.endDate,
      orgId: '',
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: null,
    };
  }
}

export interface FDPDocument {
  _id: string;
  title: string;
  description?: string;
  organizer: string;
  facultyIds: string[];
  type: string;
  startDate: Date;
  endDate: Date;
  status: string;
  competencyIds: string[];
  orgId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class FDPOfferingRepository extends Repository<FDPDocument> {
  protected collectionName = 'fdp_offerings';

  async findEntityById(id: string): Promise<FDP | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByOrganizer(organizer: string): Promise<FDP[]> {
    const docs = await this.find({ organizer } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByFaculty(facultyId: string): Promise<FDP[]> {
    const docs = await this.find({ facultyIds: facultyId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByStatus(status: string): Promise<FDP[]> {
    const docs = await this.find({ status } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByOrg(orgId: string): Promise<FDP[]> {
    const docs = await this.find({ orgId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(fdp: FDP): Promise<void> {
    const doc = this.toDocument(fdp);
    await this.collection.updateOne(
      { _id: fdp.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: FDPDocument): FDP {
    return new FDP({
      id: EntityId.fromString(doc._id.toString()),
      title: doc.title,
      description: doc.description,
      organizer: doc.organizer,
      facultyIds: doc.facultyIds ?? [],
      type: doc.type as any,
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status as any,
      competencyIds: doc.competencyIds ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(f: FDP): FDPDocument {
    return {
      _id: f.id.toString(),
      title: f.title,
      description: f.description,
      organizer: f.organizer,
      facultyIds: f.facultyIds as string[],
      type: f.type,
      startDate: f.startDate,
      endDate: f.endDate,
      status: f.status,
      competencyIds: f.competencyIds as string[],
      orgId: '',
      version: f.version,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      deletedAt: null,
    };
  }
}
