import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthPayload } from '../types/index.js';

export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshTtl,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AuthPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { userId: string };
}

export function decodeToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.decode(token, { json: true });
  } catch {
    return null;
  }
}
