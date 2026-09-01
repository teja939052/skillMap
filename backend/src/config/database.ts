import { MongoClient, Db, Collection, Document, IndexDescription } from 'mongodb';
import { env } from './env.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.mongodb.uri, {
    maxPoolSize: 20,
    minPoolSize: 5,
    retryWrites: true,
    retryReads: true,
  });

  await client.connect();
  db = client.db(env.mongodb.db);
  await createIndexes(db);
  return db;
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return db;
}

export function getCollection<T extends Document>(name: string): Collection<T> {
  return getDb().collection<T>(name);
}

async function createIndexes(database: Db): Promise<void> {
  const indexJobs: Array<{ collection: string; index: IndexDescription }> = [
    { collection: 'users', index: { key: { email: 1 }, name: 'uniq_email', unique: true } },
    { collection: 'users', index: { key: { role: 1 }, name: 'idx_role' } },
    { collection: 'users', index: { key: { status: 1 }, name: 'idx_status' } },
    { collection: 'users', index: { key: { createdAt: -1 }, name: 'idx_createdAt' } },
    { collection: 'organizations', index: { key: { slug: 1 }, name: 'uniq_slug', unique: true } },
    { collection: 'organizations', index: { key: { type: 1 }, name: 'idx_type' } },
    { collection: 'memberships', index: { key: { userId: 1, organizationId: 1 }, name: 'uniq_membership', unique: true } },
    { collection: 'memberships', index: { key: { organizationId: 1 }, name: 'idx_org' } },
    { collection: 'competencies', index: { key: { slug: 1 }, name: 'uniq_slug', unique: true } },
    { collection: 'competencies', index: { key: { parentId: 1 }, name: 'idx_parent' } },
    { collection: 'competencies', index: { key: { type: 1 }, name: 'idx_type' } },
    { collection: 'roleBlueprints', index: { key: { organizationId: 1 }, name: 'idx_org' } },
    { collection: 'roleBlueprints', index: { key: { isActive: 1 }, name: 'idx_active' } },
    { collection: 'assessments', index: { key: { isPublished: 1 }, name: 'idx_published' } },
    { collection: 'assessments', index: { key: { competencyIds: 1 }, name: 'idx_competency' } },
    { collection: 'assessmentAttempts', index: { key: { userId: 1, assessmentId: 1 }, name: 'idx_user_assessment' } },
    { collection: 'assessmentAttempts', index: { key: { assessmentId: 1 }, name: 'idx_assessment' } },
    { collection: 'evidence', index: { key: { ownerId: 1 }, name: 'idx_owner' } },
    { collection: 'evidence', index: { key: { competencyId: 1 }, name: 'idx_competency' } },
    { collection: 'evidence', index: { key: { verificationStatus: 1 }, name: 'idx_status' } },
    { collection: 'opportunities', index: { key: { organizationId: 1 }, name: 'idx_org' } },
    { collection: 'opportunities', index: { key: { status: 1 }, name: 'idx_status' } },
    { collection: 'opportunities', index: { key: { type: 1 }, name: 'idx_type' } },
    { collection: 'opportunities', index: { key: { deadline: 1 }, name: 'idx_deadline' } },
    { collection: 'applications', index: { key: { opportunityId: 1, applicantId: 1 }, name: 'uniq_application', unique: true } },
    { collection: 'applications', index: { key: { applicantId: 1 }, name: 'idx_applicant' } },
    { collection: 'applications', index: { key: { status: 1 }, name: 'idx_status' } },
    { collection: 'interventions', index: { key: { organizationId: 1 }, name: 'idx_org' } },
    { collection: 'interventions', index: { key: { status: 1 }, name: 'idx_status' } },
    { collection: 'outcomes', index: { key: { userId: 1 }, name: 'idx_user' } },
    { collection: 'outcomes', index: { key: { interventionId: 1 }, name: 'idx_intervention' } },
    { collection: 'notifications', index: { key: { userId: 1, read: 1 }, name: 'idx_user_read' } },
    { collection: 'notifications', index: { key: { createdAt: -1 }, name: 'idx_createdAt' } },
    { collection: 'auditLogs', index: { key: { userId: 1 }, name: 'idx_user' } },
    { collection: 'auditLogs', index: { key: { action: 1 }, name: 'idx_action' } },
    { collection: 'auditLogs', index: { key: { createdAt: -1 }, name: 'idx_createdAt' } },
    { collection: 'refreshTokens', index: { key: { token: 1 }, name: 'uniq_token', unique: true } },
    { collection: 'refreshTokens', index: { key: { userId: 1 }, name: 'idx_user' } },
    { collection: 'refreshTokens', index: { key: { expiresAt: 1 }, name: 'idx_expires', expireAfterSeconds: 0 } },
  ];

  for (const job of indexJobs) {
    try {
      await database.collection(job.collection).createIndex(job.index.key, {
        name: job.index.name,
        unique: job.index.unique,
        expireAfterSeconds: job.index.expireAfterSeconds,
      });
    } catch {
      // Index may already exist; continue
    }
  }
}
