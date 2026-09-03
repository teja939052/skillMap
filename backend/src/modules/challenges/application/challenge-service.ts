import { EntityId } from '../../../shared/domain/entity.js';
import { IndustryChallenge, ChallengeSubmission } from '../domain/challenge.js';
import { ChallengeRepository, ChallengeSubmissionRepository } from '../infrastructure/repositories.js';

interface SkillProfile {
  competencyId: string;
  proficiency: number;
  confidence: number;
}

export class ChallengeService {
  constructor(
    private readonly repo: ChallengeRepository,
    private readonly submissionRepo: ChallengeSubmissionRepository
  ) {}

  async list(filters: { difficulty?: string; status?: string; page?: number; limit?: number } = {}) {
    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    else filter.status = { $in: ['open', 'active'] };
    if (filters.difficulty) filter.difficulty = filters.difficulty;
    const challenges = await this.repo.findChallenges(filter);
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const items = challenges.map((c) => this.serialize(c)).slice((page - 1) * limit, page * limit);
    return { items, total: challenges.length, page, limit };
  }

  async getById(id: string) {
    const c = await this.repo.findChallengeById(id);
    return c ? this.serialize(c) : null;
  }

  async create(data: any, userId: string) {
    if (!data.title || !data.description || !data.requiredSkills?.length || !data.durationDays) {
      return { success: false, error: 'title, description, requiredSkills and durationDays are required' };
    }
    const challenge = new IndustryChallenge({
      id: EntityId.create(),
      title: data.title,
      description: data.description,
      companyName: data.companyName || 'Industry Partner',
      postedBy: userId,
      orgId: data.orgId || 'org-demo',
      requiredSkills: data.requiredSkills,
      durationDays: data.durationDays,
      reward: data.reward,
      currency: data.currency || 'INR',
      difficulty: data.difficulty || 'intermediate',
      deliverables: data.deliverables || [],
      status: 'open',
      submissionsCount: 0,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.repo.save(challenge);
    return { success: true, value: this.serialize(challenge) };
  }

  async submit(challengeId: string, studentId: string, data: any) {
    const challenge = await this.repo.findChallengeById(challengeId);
    if (!challenge) return { success: false, error: 'Challenge not found' };
    if (!challenge.isOpen()) return { success: false, error: 'Challenge is not open for submissions' };
    const dup = await this.submissionRepo.findByStudentAndChallenge(challengeId, studentId);
    if (dup) return { success: false, error: 'You have already submitted to this challenge' };
    const sub = new ChallengeSubmission({
      id: EntityId.create(),
      challengeId,
      studentId,
      message: data.message || '',
      artifactUrl: data.artifactUrl,
      status: 'submitted',
      orgId: challenge.orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.submissionRepo.save(sub);
    challenge.submissionsCount += 1;
    await this.repo.save(challenge);
    return { success: true, value: this.serializeSubmission(sub) };
  }

  async evaluate(challengeId: string, submissionId: string, data: any, evaluatorId: string) {
    const sub = await this.submissionRepo.findSubmissionById(submissionId);
    if (!sub) return { success: false, error: 'Submission not found' };
    if (sub.challengeId !== challengeId) return { success: false, error: 'Submission does not belong to this challenge' };
    if (data.score === undefined) return { success: false, error: 'score is required' };
    const subProps = sub as unknown as { status: string; evaluationScore?: number; evaluationFeedback?: string; evaluatedBy?: string; updatedAt: Date };
    subProps.status = data.accepted ? 'accepted' : 'evaluated';
    subProps.evaluationScore = data.score;
    subProps.evaluationFeedback = data.feedback;
    subProps.evaluatedBy = evaluatorId;
    subProps.updatedAt = new Date();
    await this.submissionRepo.save(sub);
    return { success: true, value: this.serializeSubmission(sub) };
  }

  async mySubmissions(studentId: string) {
    const subs = await this.submissionRepo.findSubmissions({ studentId });
    return { items: subs.map((s) => this.serializeSubmission(s)), total: subs.length };
  }

  async matchForStudent(skills: SkillProfile[], limit = 10) {
    const challenges = await this.repo.findChallenges({ status: { $in: ['open', 'active'] } });
    const scored = challenges
      .map((c) => ({ challenge: c, score: this.calculateMatch(c, skills) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return { items: scored.map(({ challenge, score }) => ({ ...this.serialize(challenge), matchScore: score })), total: scored.length };
  }

  private calculateMatch(challenge: IndustryChallenge, skills: SkillProfile[]): number {
    let totalWeight = 0;
    let weighted = 0;
    for (const req of challenge.requiredSkills) {
      totalWeight += req.weight;
      const user = skills.find((s) => s.competencyId === req.competencyId);
      if (!user) continue;
      weighted += Math.min(1, user.proficiency / Math.max(1, req.minLevel)) * user.confidence * req.weight;
    }
    return totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;
  }

  private serialize(c: IndustryChallenge) {
    return {
      id: c.id.toString(),
      title: c.title,
      description: c.description,
      companyName: c.companyName,
      postedBy: c.postedBy,
      orgId: c.orgId,
      requiredSkills: c.requiredSkills,
      durationDays: c.durationDays,
      reward: c.reward,
      currency: c.currency,
      difficulty: c.difficulty,
      deliverables: c.deliverables,
      status: c.status,
      submissionsCount: c.submissionsCount,
      deadline: c.deadline,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private serializeSubmission(s: ChallengeSubmission) {
    return {
      id: s.id.toString(),
      challengeId: s.challengeId,
      studentId: s.studentId,
      message: s.message,
      artifactUrl: s.artifactUrl,
      status: s.status,
      evaluationScore: s.evaluationScore,
      evaluationFeedback: s.evaluationFeedback,
      evaluatedBy: s.evaluatedBy,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }
}
