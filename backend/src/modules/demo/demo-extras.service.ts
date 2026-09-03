import { FreelanceTask } from '../freelance/domain/freelance-task.js';
import { FreelanceTaskRepository } from '../freelance/infrastructure/repositories.js';
import { NotificationRepository } from '../notifications/infrastructure/repositories.js';
import { AppNotification } from '../notifications/domain/notification.js';
import { EntityId } from '../../shared/domain/entity.js';

const ORG = 'org-demo';

export async function seedDemoExtras(competencyIds: { python: string; sql: string; restApi: string; docker: string; aws: string; git: string }) {
  const freelanceRepo = new FreelanceTaskRepository();
  const notificationRepo = new NotificationRepository();

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

  return { freelanceTasks: count, notificationSeeded: 1 };
}
