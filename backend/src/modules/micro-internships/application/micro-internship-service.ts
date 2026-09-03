import { EntityId } from '../../../shared/domain/entity.js';
import { MicroInternship, MicroInternshipApplication } from '../domain/micro-internship.js';
import { MicroInternshipRepository, MicroInternshipApplicationRepository } from '../infrastructure/repositories.js';

interface SkillProfile {
  competencyId: string;
  proficiency: number;
  confidence: number;
}

export class MicroInternshipService {
  constructor(
    private readonly repo: MicroInternshipRepository,
    private readonly appRepo: MicroInternshipApplicationRepository
  ) {}

  async list(filters: any = {}) {
    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    else filter.status = { $in: ['open', 'matched'] };
    const internships = await this.repo.findInternships(filter);
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const items = internships.map((i) => this.serialize(i)).slice((page - 1) * limit, page * limit);
    return { items, total: internships.length, page, limit };
  }

  async getById(id: string) {
    const m = await this.repo.findInternshipById(id);
    return m ? this.serialize(m) : null;
  }

  async create(data: any, userId: string) {
    if (!data.title || !data.description || !data.requiredSkills?.length || !data.durationDays) {
      return { success: false, error: 'title, description, requiredSkills and durationDays are required' };
    }
    if (![3, 7, 14, 30].includes(Number(data.durationDays))) {
      return { success: false, error: 'durationDays must be one of 3, 7, 14, 30' };
    }
    const ms = new MicroInternship({
      id: EntityId.create(),
      title: data.title,
      description: data.description,
      companyName: data.companyName || 'Industry Partner',
      postedBy: userId,
      orgId: data.orgId || 'org-demo',
      requiredSkills: data.requiredSkills,
      durationDays: Number(data.durationDays),
      stipend: data.stipend,
      currency: data.currency || 'INR',
      positions: data.positions || 1,
      status: 'open',
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.repo.save(ms);
    return { success: true, value: this.serialize(ms) };
  }

  async apply(internshipId: string, studentId: string, data: any) {
    const ms = await this.repo.findInternshipById(internshipId);
    if (!ms) return { success: false, error: 'Micro-internship not found' };
    if (!ms.isOpen()) return { success: false, error: 'Micro-internship is not open for applications' };
    const dup = await this.appRepo.findByStudentAndInternship(internshipId, studentId);
    if (dup) return { success: false, error: 'You have already applied' };
    const app = new MicroInternshipApplication({
      id: EntityId.create(),
      internshipId,
      studentId,
      message: data.message || '',
      status: 'applied',
      orgId: ms.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.appRepo.save(app);
    return { success: true, value: this.serializeApplication(app) };
  }

  async updateApplicationStatus(internshipId: string, applicationId: string, data: any, actorId: string) {
    const app = await this.appRepo.findApplicationById(applicationId);
    if (!app) return { success: false, error: 'Application not found' };
    if (app.internshipId !== internshipId) return { success: false, error: 'Application does not belong to this micro-internship' };
    const props = app as unknown as { status: string; evaluationScore?: number; evaluationFeedback?: string; updatedAt: Date };
    props.status = data.status;
    props.evaluationScore = data.score;
    props.evaluationFeedback = data.feedback;
    props.updatedAt = new Date();
    await this.appRepo.save(app);
    return { success: true, value: this.serializeApplication(app) };
  }

  async myApplications(studentId: string) {
    const apps = await this.appRepo.findApplications({ studentId });
    return { items: apps.map((a) => this.serializeApplication(a)), total: apps.length };
  }

  async matchForStudent(skills: SkillProfile[], limit = 10) {
    const internships = await this.repo.findInternships({ status: { $in: ['open', 'matched'] } });
    const scored = internships
      .map((i) => ({ internship: i, score: this.calculateMatch(i, skills) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return { items: scored.map(({ internship, score }) => ({ ...this.serialize(internship), matchScore: score })), total: scored.length };
  }

  private calculateMatch(ms: MicroInternship, skills: SkillProfile[]): number {
    let totalWeight = 0;
    let weighted = 0;
    for (const req of ms.requiredSkills) {
      totalWeight += req.weight;
      const user = skills.find((s) => s.competencyId === req.competencyId);
      if (!user) continue;
      weighted += Math.min(1, user.proficiency / Math.max(1, req.minLevel)) * user.confidence * req.weight;
    }
    return totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;
  }

  private serialize(m: MicroInternship) {
    return {
      id: m.id.toString(), title: m.title, description: m.description, companyName: m.companyName,
      postedBy: m.postedBy, orgId: m.orgId, requiredSkills: m.requiredSkills, durationDays: m.durationDays,
      stipend: m.stipend, currency: m.currency, positions: m.positions, status: m.status,
      deadline: m.deadline, createdAt: m.createdAt, updatedAt: m.updatedAt,
    };
  }

  private serializeApplication(a: MicroInternshipApplication) {
    return {
      id: a.id.toString(), internshipId: a.internshipId, studentId: a.studentId, message: a.message,
      status: a.status, evaluationScore: a.evaluationScore, evaluationFeedback: a.evaluationFeedback,
      createdAt: a.createdAt, updatedAt: a.updatedAt,
    };
  }
}
