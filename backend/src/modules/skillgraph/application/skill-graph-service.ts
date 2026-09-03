import { EntityId } from '../../../shared/domain/entity.js';
import { Result, ok, err, NotFoundError } from '../../../shared/domain/result.js';
import { SkillGraphNode, SkillGraphRole } from '../domain/skill-graph.js';
import { SkillGraphRepository } from '../infrastructure/repositories.js';

export class SkillGraphService {
  constructor(private readonly repo: SkillGraphRepository) {}

  async getGraph(domain?: string): Promise<Result<SkillGraphNode[]>> {
    const nodes = domain ? await this.repo.findByDomain(domain) : await this.repo.listAll();
    return ok(nodes);
  }

  async getRoleTargets(roleId: string): Promise<Result<SkillGraphNode[]>> {
    const all = await this.repo.listAll();
    const matched = all.filter((n) => n.targetRoleIds.includes(roleId));
    return ok(matched);
  }

  async getLearningPath(
    studentSkills: string[],
    targetRoleId: string
  ): Promise<Result<Array<{
    competencyId: string;
    name: string;
    status: 'ready' | 'partial' | 'missing';
    currentLevel: number;
    targetLevel: number;
    estimatedHours: number;
    prerequisites: string[];
    order: number;
  }>>> {
    const roleSkills = await this.getRoleTargets(targetRoleId);
    if (!roleSkills.success) return roleSkills;

    const skillMap = new Map(roleSkills.value.map((n) => [n.competencyId, n]));
    const known = new Set(studentSkills);

    const path = roleSkills.value.map((node) => {
      const hasSkill = known.has(node.competencyId);
      const prereqsMet = node.prerequisites.every((p) => known.has(p));
      let status: 'ready' | 'partial' | 'missing' = 'missing';
      if (hasSkill && prereqsMet) status = 'ready';
      else if (hasSkill || prereqsMet) status = 'partial';

      return {
        competencyId: node.competencyId,
        name: node.name,
        status,
        currentLevel: hasSkill ? 70 : 0,
        targetLevel: 70,
        estimatedHours: node.estimatedHours,
        prerequisites: node.prerequisites,
        order: node.difficulty,
      };
    });

    const sorted = path
      .filter((p) => p.status !== 'ready')
      .sort((a, b) => a.order - b.order || a.prerequisites.length - b.prerequisites.length);

    return ok(sorted);
  }

  async seedDemoData(orgId: string): Promise<Result<SkillGraphNode[]>> {
    const existing = await this.repo.listAll();
    if (existing.length > 0) return ok(existing);

    const nodes: SkillGraphNode[] = [];
    const seed = (id: string, name: string, type: string, domain: string, childIds: string[] = [], targetRoleIds: string[] = [], prerequisites: string[] = []) => {
      const node = new SkillGraphNode({
        id: EntityId.create(),
        competencyId: id,
        name,
        type,
        parentIds: [],
        childIds,
        targetRoleIds,
        domain,
        difficulty: childIds.length + 1,
        estimatedHours: childIds.length > 0 ? 40 : 20,
        prerequisites,
        orgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      nodes.push(node);
      return node;
    };

    seed('python', 'Python', 'technology', 'Data', [], ['data-analyst', 'data-engineer']);
    seed('sql', 'SQL', 'technology', 'Data', [], ['data-analyst', 'data-engineer']);
    seed('docker', 'Docker', 'tool', 'DevOps', [], ['data-engineer'], ['linux']);
    seed('linux', 'Linux', 'tool', 'DevOps', [], ['data-engineer']);
    seed('rest-api', 'REST APIs', 'technology', 'Web', [], ['backend-developer'], ['python']);
    seed('aws', 'AWS', 'technology', 'Cloud', [], ['cloud-engineer'], ['docker']);
    seed('git', 'Git', 'tool', 'DevOps', [], ['backend-developer', 'data-engineer']);

    await this.repo.bulkSave(nodes);
    return ok(nodes);
  }
}
