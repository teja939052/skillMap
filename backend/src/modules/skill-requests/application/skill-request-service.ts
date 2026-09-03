import { EntityId } from '../../../shared/domain/entity.js';
import { IndustrySkillRequest } from '../domain/skill-request.js';
import { SkillRequestRepository } from '../infrastructure/repositories.js';

export interface SupplyResolver {
  countMatchingStudents(institutionId: string, requirement: { competencyId: string; minLevel: number }): Promise<number>;
}

export class SkillRequestService {
  constructor(
    private readonly repo: SkillRequestRepository,
    private readonly supplyResolver: SupplyResolver
  ) {}

  async list(filters: any = {}) {
    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    const requests = await this.repo.findRequests(filter);
    return { items: requests.map((r) => this.serialize(r)), total: requests.length };
  }

  async getById(id: string) {
    const r = await this.repo.findRequestById(id);
    return r ? this.serialize(r) : null;
  }

  async create(data: any, userId: string, institutionId?: string) {
    if (!data.title || !data.requirements?.length || !data.projectDurationDays) {
      return { success: false, error: 'title, requirements and projectDurationDays are required' };
    }
    const request = new IndustrySkillRequest({
      id: EntityId.create(),
      title: data.title,
      description: data.description || '',
      companyName: data.companyName || 'Industry Partner',
      postedBy: userId,
      orgId: data.orgId || 'org-demo',
      requirements: data.requirements,
      projectDurationDays: Number(data.projectDurationDays),
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Compute supply/shortfall from real student data
    if (institutionId) {
      const supply = await this.computeSupply(institutionId, data.requirements);
      const requestedTotal = data.requirements.reduce((s: number, r: any) => s + (r.requestedCount || 0), 0);
      request.supply = supply;
      request.shortfall = Math.max(0, requestedTotal - supply);
    }
    await this.repo.save(request);
    return { success: true, value: this.serialize(request) };
  }

  async computeSupply(institutionId: string, requirements: Array<{ competencyId: string; minLevel: number }>): Promise<number> {
    // A student counts as available if they meet EVERY requested skill's minimum.
    const perSkill = [];
    for (const req of requirements) {
      perSkill.push(await this.supplyResolver.countMatchingStudents(institutionId, req));
    }
    // Conservative: supply = min across skills (bottleneck), mimicking cohort availability.
    return perSkill.length ? Math.min(...perSkill) : 0;
  }

  async takeAction(requestId: string, action: string) {
    const request = await this.repo.findRequestById(requestId);
    if (!request) return { success: false, error: 'Request not found' };
    request.status = action === 'close' ? 'closed' : request.status === 'open' ? 'in_action' : request.status;
    request.updatedAt = new Date();
    await this.repo.save(request);
    return { success: true, value: this.serialize(request) };
  }

  serialize(r: IndustrySkillRequest) {
    return {
      id: r.id.toString(), title: r.title, description: r.description, companyName: r.companyName,
      postedBy: r.postedBy, orgId: r.orgId, requirements: r.requirements,
      projectDurationDays: r.projectDurationDays, status: r.status,
      supply: r.supply, shortfall: r.shortfall, createdAt: r.createdAt, updatedAt: r.updatedAt,
    };
  }
}
