import { Collection, Db, Document, Filter, FindOptions, ObjectId, OptionalId, ServerApiVersion, MongoClient } from 'mongodb';
import { env } from '../../config/env.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.mongodb.uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
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

export interface TenantFilter {
  orgId?: string;
  organizationId?: string;
}

export function withTenantScope<T extends Record<string, unknown>>(
  filter: T,
  tenantFilter?: TenantFilter
): T {
  if (!tenantFilter) return filter;
  return { ...filter, ...tenantFilter };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order: 'asc' | 'desc';
}

export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: 20,
  order: 'desc',
  sort: 'createdAt',
};

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export async function paginatedQuery<T extends Document>(
  collection: Collection<T>,
  filter: Filter<T>,
  params: PaginationParams
): Promise<PaginatedResult<T>> {
  const { page, limit, sort = 'createdAt', order } = params;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as unknown as Promise<T[]>,
    collection.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

async function createIndexes(database: Db): Promise<void> {
  const indexJobs = [
    { coll: 'users', spec: { email: 1 }, opts: { unique: true, name: 'uniq_email' } },
    { coll: 'users', spec: { googleId: 1 }, opts: { partialFilterExpression: { googleId: { $exists: true, $ne: null } }, unique: true, name: 'uniq_googleId' } },
    { coll: 'organizations', spec: { slug: 1 }, opts: { unique: true, name: 'uniq_slug' } },
    { coll: 'memberships', spec: { userId: 1, organizationId: 1 }, opts: { unique: true, name: 'uniq_membership' } },
    { coll: 'memberships', spec: { organizationId: 1, status: 1 }, opts: { name: 'idx_org_status' } },
    { coll: 'competencies', spec: { slug: 1 }, opts: { unique: true, name: 'uniq_competency_slug' } },
    { coll: 'competencies', spec: { parentId: 1 }, opts: { name: 'idx_parent' } },
    { coll: 'student_competencies', spec: { studentId: 1, competencyId: 1 }, opts: { unique: true, name: 'uniq_student_comp' } },
    { coll: 'evidence_items', spec: { ownerId: 1, competencyId: 1 }, opts: { name: 'idx_owner_comp' } },
    { coll: 'evidence_items', spec: { verificationStatus: 1 }, opts: { name: 'idx_verification' } },
    { coll: 'opportunities', spec: { organizationId: 1, status: 1 }, opts: { name: 'idx_org_status' } },
    { coll: 'opportunities', spec: { type: 1, status: 1 }, opts: { name: 'idx_type_status' } },
    { coll: 'applications', spec: { opportunityId: 1, applicantId: 1 }, opts: { unique: true, name: 'uniq_application' } },
    { coll: 'applications', spec: { applicantId: 1, status: 1 }, opts: { name: 'idx_applicant_status' } },
    { coll: 'assessments', spec: { competencyIds: 1, isPublished: 1 }, opts: { name: 'idx_comp_published' } },
    { coll: 'assessment_attempts', spec: { assessmentId: 1, userId: 1 }, opts: { name: 'idx_assessment_user' } },
    { coll: 'interventions', spec: { organizationId: 1, status: 1 }, opts: { name: 'idx_org_status' } },
    { coll: 'notifications', spec: { userId: 1, read: 1, createdAt: -1 }, opts: { name: 'idx_user_read_created' } },
    { coll: 'audit_logs', spec: { orgId: 1, createdAt: -1 }, opts: { name: 'idx_org_created' } },
    { coll: 'outbox', spec: { published: 1, createdAt: 1 }, opts: { name: 'idx_unpublished' } },
    { coll: 'outbox', spec: { 'event.eventType': 1 }, opts: { name: 'idx_event_type' } },
    { coll: 'refresh_sessions', spec: { tokenHash: 1 }, opts: { unique: true, name: 'uniq_token_hash' } },
    { coll: 'refresh_sessions', spec: { userId: 1 }, opts: { name: 'idx_user_sessions' } },
    { coll: 'refresh_sessions', spec: { expiresAt: 1 }, opts: { name: 'idx_expires', expireAfterSeconds: 0 } },
  ];

  await Promise.all(
    indexJobs.map((job) =>
      database.collection(job.coll).createIndex(job.spec as any, job.opts).catch(() => {
        // Index may already exist; continue
      })
    )
  );
}

