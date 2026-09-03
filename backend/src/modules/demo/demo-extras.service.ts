import { FreelanceTask } from '../freelance/domain/freelance-task.js';
import { FreelanceTaskRepository } from '../freelance/infrastructure/repositories.js';
import { NotificationRepository } from '../notifications/infrastructure/repositories.js';
import { AppNotification } from '../notifications/domain/notification.js';
import { SkillGraphNode } from '../skillgraph/domain/skill-graph.js';
import { SkillGraphRepository } from '../skillgraph/infrastructure/repositories.js';
import { SkillMission } from '../missions/domain/mission.js';
import { SkillMissionRepository } from '../missions/infrastructure/repositories.js';
import { EntityId } from '../../shared/domain/entity.js';

const ORG = 'org-demo';

export async function seedDemoExtras(competencyIds: { python: string; sql: string; restApi: string; docker: string; aws: string; git: string }) {
  const freelanceRepo = new FreelanceTaskRepository();
  const notificationRepo = new NotificationRepository();
  const skillGraphRepo = new SkillGraphRepository();
  const missionRepo = new SkillMissionRepository();

  const taskSeed = [
    { title: 'Clean & dedupe a customer dataset', category: 'Data', skills: [{ competencyId: competencyIds.python, minLevel: 60, weight: 0.7 }, { competencyId: competencyIds.sql, minLevel: 55, weight: 0.3 }], payout: 1500, hours: 8, desc: 'Clean and dedupe a 50k-row customer CSV using Python and SQL. Deliver a tidy dataset + summary.' },
    { title: 'Build a product-price web scraper', category: 'Web', skills: [{ competencyId: competencyIds.python, minLevel: 65, weight: 0.8 }, { competencyId: competencyIds.restApi, minLevel: 50, weight: 0.2 }], payout: 2000, hours: 10, desc: 'Scrape a competitor price page, store results in JSON, expose a tiny REST API.' },
    { title: 'Analyze a business dataset & report', category: 'Data', skills: [{ competencyId: competencyIds.sql, minLevel: 55, weight: 0.5 }, { competencyId: competencyIds.python, minLevel: 60, weight: 0.5 }], payout: 3000, hours: 12, desc: 'Analyze quarterly sales data, find trends, produce a 1-page insight deck.' },
    { title: 'Dockerize a legacy Node service', category: 'DevOps', skills: [{ competencyId: competencyIds.docker, minLevel: 55, weight: 1 }], payout: 2500, hours: 8, desc: 'Write a Dockerfile + compose file for an internal microservice.' },
    { title: 'Set up CI for a GitHub repo', category: 'DevOps', skills: [{ competencyId: competencyIds.git, minLevel: 55, weight: 0.6 }, { competencyId: competencyIds.docker, minLevel: 45, weight: 0.4 }], payout: 1200, hours: 5, desc: 'Add GitHub Actions CI that lints, tests and builds on push.' },
  ];

  const rahulId = 'demo-rahul-user';
  for (const t of taskSeed) {
    const task = new FreelanceTask({
      id: EntityId.create(),
      title: t.title,
      description: t.desc,
      category: t.category,
      requiredSkills: t.skills,
      payout: t.payout,
      currency: 'INR',
      estimatedHours: t.hours,
      postedBy: 'demo-industry',
      orgId: ORG,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await freelanceRepo.save(task);
  }

  const count = await (freelanceRepo as any).collection.countDocuments({ orgId: ORG });

  const notif = new AppNotification({
    id: EntityId.create(),
    userId: rahulId,
    title: 'New Matched Freelance Task — Data Cleaning',
    body: 'Task: Clean & dedupe a customer dataset · Match 92% · ₹1,500',
    type: 'freelance_match',
    link: '/earn',
    read: false,
    createdAt: new Date(),
  });
  await notificationRepo.save(notif);

  const graphNodes = [
    { competencyId: competencyIds.python, name: 'Python', type: 'technology', parentIds: [], childIds: [], targetRoleIds: ['data-analyst', 'backend-developer'], domain: 'Data', difficulty: 1, estimatedHours: 20, prerequisites: [] },
    { competencyId: competencyIds.sql, name: 'SQL', type: 'technology', parentIds: [], childIds: [], targetRoleIds: ['data-analyst', 'data-engineer'], domain: 'Data', difficulty: 1, estimatedHours: 20, prerequisites: [] },
    { competencyId: competencyIds.docker, name: 'Docker', type: 'tool', parentIds: [], childIds: [], targetRoleIds: ['data-engineer'], domain: 'DevOps', difficulty: 2, estimatedHours: 30, prerequisites: [competencyIds.git] },
    { competencyId: competencyIds.git, name: 'Git', type: 'tool', parentIds: [], childIds: [], targetRoleIds: ['backend-developer', 'data-engineer'], domain: 'DevOps', difficulty: 1, estimatedHours: 15, prerequisites: [] },
    { competencyId: competencyIds.restApi, name: 'REST APIs', type: 'technology', parentIds: [], childIds: [], targetRoleIds: ['backend-developer'], domain: 'Web', difficulty: 2, estimatedHours: 25, prerequisites: [competencyIds.python] },
    { competencyId: competencyIds.aws, name: 'AWS', type: 'technology', parentIds: [], childIds: [], targetRoleIds: ['cloud-engineer'], domain: 'Cloud', difficulty: 3, estimatedHours: 40, prerequisites: [competencyIds.docker] },
  ];

  for (const node of graphNodes) {
    const graphNode = new SkillGraphNode({
      id: EntityId.create(),
      competencyId: node.competencyId,
      name: node.name,
      type: node.type,
      parentIds: node.parentIds,
      childIds: node.childIds,
      targetRoleIds: node.targetRoleIds,
      domain: node.domain,
      difficulty: node.difficulty,
      estimatedHours: node.estimatedHours,
      prerequisites: node.prerequisites,
      orgId: ORG,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await skillGraphRepo.save(graphNode);
  }

  const demoGaps = [
    { competencyId: competencyIds.aws, competencyName: 'AWS', gap: 43, importance: 'must_have' },
    { competencyId: competencyIds.docker, competencyName: 'Docker', gap: 25, importance: 'nice_to_have' },
  ];

  for (const gap of demoGaps) {
    const mission = new SkillMission({
      id: EntityId.create(),
      studentId: rahulId,
      competencyId: gap.competencyId,
      competencyName: gap.competencyName,
      title: `Master ${gap.competencyName}`,
      description: `Close the gap of ${gap.gap} points and reach the target level.`,
      steps: [
        { id: `${gap.competencyId}-learn`, title: 'Learn the fundamentals', description: 'Complete guided learning materials and documentation for this skill.', type: 'learn', order: 0, evidenceRequired: false, estimatedMinutes: 120 },
        { id: `${gap.competencyId}-practice`, title: 'Practice problems', description: 'Solve structured practice problems to build muscle memory.', type: 'practice', order: 1, evidenceRequired: false, estimatedMinutes: 180 },
        { id: `${gap.competencyId}-assess`, title: 'Take a skill assessment', description: 'Validate your current level with a short assessment.', type: 'assess', order: 2, evidenceRequired: false, estimatedMinutes: 30 },
        { id: `${gap.competencyId}-project`, title: 'Build a real project', description: 'Apply the skill in a small end-to-end project.', type: 'project', order: 3, evidenceRequired: false, estimatedMinutes: 240 },
        { id: `${gap.competencyId}-verify`, title: 'Get verification', description: 'Submit evidence for faculty or industry verification.', type: 'verify', order: 4, evidenceRequired: true, estimatedMinutes: 60 },
      ],
      status: 'active',
      currentStep: 0,
      targetLevel: 100,
      orgId: ORG,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await missionRepo.save(mission);
  }

  return { freelanceTasks: count, notificationSeeded: 1, skillGraphNodes: graphNodes.length, missionsSeeded: demoGaps.length };
}

