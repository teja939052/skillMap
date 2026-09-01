function requireEnv(name: string, fallback: string): string {
  const value = process.env[name] || fallback;
  const isDevFallback = value.startsWith('dev-');
  if (process.env.NODE_ENV === 'production' && isDevFallback) {
    throw new Error(`[env] ${name} must be set in production — refusing dev fallback`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
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
