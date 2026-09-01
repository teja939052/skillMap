import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { MongoClient } from 'mongodb';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'skillmap';

const connection: ConnectionOptions = {
  host: new URL(REDIS_URL).hostname,
  port: parseInt(new URL(REDIS_URL).port || '6379'),
  maxRetriesPerRequest: null,
};

let db: any;

async function connectDb() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('[worker] Connected to MongoDB');
}

const QUEUES = {
  AI_PROCESSING: 'ai-processing',
  MAPPING: 'mapping',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  EXPORTS: 'exports',
  DOCUMENTS: 'documents',
  RECOMMENDATIONS: 'recommendations',
} as const;

const queues: Record<string, Queue> = {};

function getQueue(name: string): Queue {
  if (!queues[name]) {
    queues[name] = new Queue(name, { connection });
  }
  return queues[name];
}

function createWorkers() {
  new Worker(
    QUEUES.AI_PROCESSING,
    async (job) => {
      console.log(`[ai-processing] Processing job ${job.id}:`, job.name);
      const { type, data } = job.data;
      if (type === 'resume_parse') {
        await db.collection('users').updateOne(
          { _id: data.userId },
          { $set: { 'parsing.status': 'processing' } }
        );
      } else if (type === 'jd_parse') {
        await db.collection('opportunities').updateOne(
          { _id: data.opportunityId },
          { $set: { 'parsing.status': 'processing' } }
        );
      }
    },
    { connection, concurrency: 5 }
  );

  new Worker(
    QUEUES.NOTIFICATIONS,
    async (job) => {
      console.log(`[notifications] Processing job ${job.id}:`, job.name);
      const { type, userId, payload } = job.data;
      await db.collection('notifications').insertOne({
        userId,
        type,
        payload,
        read: false,
        createdAt: new Date(),
      });
    },
    { connection, concurrency: 10 }
  );

  new Worker(
    QUEUES.ANALYTICS,
    async (job) => {
      console.log(`[analytics] Processing job ${job.id}:`, job.name);
      const { type, orgId } = job.data;
      if (type === 'refresh_dashboard') {
        const stats = await db.collection('users').countDocuments({ orgId });
        await db.collection('analytics_cache').updateOne(
          { orgId, type: 'dashboard' },
          { $set: { data: { userCount: stats }, updatedAt: new Date() } },
          { upsert: true }
        );
      }
    },
    { connection, concurrency: 3 }
  );

  new Worker(
    QUEUES.RECOMMENDATIONS,
    async (job) => {
      console.log(`[recommendations] Processing job ${job.id}:`, job.name);
      const { userId } = job.data;
      const userEvidence = await db.collection('evidence').find({ ownerId: userId }).toArray();
      const userComps = userEvidence.map((e: any) => e.competencyId);
      const opportunities = await db.collection('opportunities').find({
        status: 'open',
        'requirements.competencyId': { $in: userComps },
      }).limit(20).toArray();
      await db.collection('recommendations').updateOne(
        { userId },
        { $set: { items: opportunities, updatedAt: new Date() } },
        { upsert: true }
      );
    },
    { connection, concurrency: 5 }
  );
}

async function main() {
  await connectDb();
  createWorkers();
  console.log('[worker] All workers started');
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
