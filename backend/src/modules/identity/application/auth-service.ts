import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { env } from '../../../config/env.js';
import { Result, ok, err } from '../../../shared/domain/result.js';
import { EntityId } from '../../../shared/domain/entity.js';
import { User } from '../domain/user.js';
import { UserRepository, RefreshSessionRepository } from '../infrastructure/repositories.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: RefreshSessionRepository
  ) {}

  async register(email: string, password: string, name: string, role: string): Promise<Result<User>> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      return err(new (await import('../../../shared/domain/result.js')).ConflictError('Email already registered'));
    }

    const passwordHash = await this.hashPassword(password);
    const user = new User({
      id: EntityId.create(),
      email: email.toLowerCase(),
      name,
      role: role as any,
      status: 'active',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    user.setPassword(passwordHash);

    await this.userRepo.save(user);
    return ok(user);
  }

  async login(email: string, password: string, deviceInfo?: string, ipAddress?: string): Promise<Result<TokenPair & { user: User }>> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return err(new (await import('../../../shared/domain/result.js')).UnauthorizedError('Invalid credentials'));
    }

    if (!user.canAuthenticate()) {
      return err(new (await import('../../../shared/domain/result.js')).UnauthorizedError('Account is not active'));
    }

    if (!user.passwordHash) {
      return err(new (await import('../../../shared/domain/result.js')).UnauthorizedError('Account uses OAuth login'));
    }

    const valid = await this.verifyPassword(user.passwordHash, password);
    if (!valid) {
      return err(new (await import('../../../shared/domain/result.js')).UnauthorizedError('Invalid credentials'));
    }

    user.recordLogin();
    await this.userRepo.save(user);

    const tokens = await this.generateTokenPair(user, deviceInfo, ipAddress);
    return ok({ ...tokens, user });
  }

  async refresh(refreshToken: string): Promise<Result<TokenPair>> {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);

    if (!session || !session.isValid()) {
      return err(new (await import('../../../shared/domain/result.js')).UnauthorizedError('Invalid or expired refresh token'));
    }

    const user = await this.userRepo.findUserById(session.userId);
    if (!user || !user.canAuthenticate()) {
      return err(new (await import('../../../shared/domain/result.js')).UnauthorizedError('User not found or inactive'));
    }

    session.revoke();
    await this.sessionRepo.save(session);

    const tokens = await this.generateTokenPair(user);
    return ok(tokens);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      const session = await this.sessionRepo.findByTokenHash(tokenHash);
      if (session) {
        session.revoke();
        await this.sessionRepo.save(session);
      }
    } else {
      const sessions = await this.sessionRepo.findByUser(userId);
      for (const session of sessions) {
        if (session.isValid()) {
          session.revoke();
          await this.sessionRepo.save(session);
        }
      }
    }
  }

  async validateAccessToken(token: string): Promise<Result<AuthPayload>> {
    try {
      const payload = jwt.verify(token, env.jwt.accessSecret) as AuthPayload;
      return ok(payload);
    } catch {
      return err(new (await import('../../../shared/domain/result.js')).UnauthorizedError('Invalid or expired token'));
    }
  }

  private async generateTokenPair(user: User, deviceInfo?: string, ipAddress?: string): Promise<TokenPair> {
    const payload: AuthPayload = {
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessTtl as any,
    });

    const refreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    const session = new (await import('../domain/user.js')).RefreshSession({
      id: EntityId.create(),
      userId: user.id.toString(),
      tokenHash,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.sessionRepo.save(session);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
