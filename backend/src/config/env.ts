function requireEnv(name: string, fallback: string): string {
  const value = process.env[name] || fallback;
  const isDevFallback = value.startsWith('dev-');
  if (process.env.NODE_ENV === 'production' && isDevFallback) {
    throw new Error(`[env] ${name} must be set in production — refusing dev fallback`);
  }
  return value;
}

function resolvePort(): number {
  // Render's service Port setting is 4000 (Render scans "port 4000 from PORT
  // environment variable"). Force 4000 in production so the app binds exactly
  // the port Render probes. In development, honor PORT or default to 4000.
  if (process.env.NODE_ENV === 'production') return 4000;
  if (process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!Number.isNaN(p) && p > 0) return p;
  }
  return 4000;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: resolvePort(),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongodb: {
    uri: process.env.MONGO_URL || 'mongodb://localhost:27017',
    db: process.env.DB_NAME || 'skillmap',
  },
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev-access-secret-change-in-production'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};
