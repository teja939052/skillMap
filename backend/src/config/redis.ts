import IORedis from 'ioredis';
import { env } from './env.js';

let redis: IORedis | null = null;

export function getRedis(): IORedis {
  if (!redis) {
    redis = new IORedis(env.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

export async function connectRedis(): Promise<IORedis> {
  const r = getRedis();
  if (r.status !== 'ready' && r.status !== 'connecting') {
    await r.connect();
  }
  return r;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
