import { ObjectId } from 'mongodb';
import { UserModel } from '../models/user.js';
import { OrganizationModel } from '../models/organization.js';
import { MembershipModel } from '../models/membership.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuditService } from './audit.service.js';
import { getCollection } from '../config/database.js';
import type { AuthPayload, User } from '../types/index.js';

const REFRESH_TTL_DAYS = 7;

export const AuthService = {
  async register(data: { email: string; password: string; name: string; role: User['role'] }) {
    const existing = await UserModel.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserModel.create({
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
    });

    await AuditService.log({
      userId: user._id.toString(),
      action: 'user.register',
      resource: 'users',
      resourceId: user._id.toString(),
    });

    return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
  },

  async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account suspended', 403);
    }

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    await UserModel.updateLastLogin(user._id.toString());

    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    const refreshTokens = getCollection('refreshTokens');
    await refreshTokens.insertOne({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
      revokedAt: null,
      createdAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  },

  async refresh(refreshToken: string) {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const refreshTokens = getCollection('refreshTokens');
    const stored = await refreshTokens.findOne({
      token: refreshToken,
      userId: new ObjectId(payload.userId),
      revokedAt: null,
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token expired or revoked', 401);
    }

    await refreshTokens.updateOne(
      { _id: stored._id },
      { $set: { revokedAt: new Date() } }
    );

    const user = await UserModel.findById(payload.userId);
    if (!user || user.status !== 'active') {
      throw new AppError('User not found or inactive', 401);
    }

    const authPayload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(authPayload);
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString() });

    await refreshTokens.insertOne({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
      revokedAt: null,
      createdAt: new Date(),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string, refreshToken?: string) {
    const refreshTokens = getCollection('refreshTokens');
    if (refreshToken) {
      await refreshTokens.updateOne(
        { token: refreshToken, userId: new ObjectId(userId) },
        { $set: { revokedAt: new Date() } }
      );
    } else {
      await refreshTokens.updateMany(
        { userId: new ObjectId(userId), revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }
  },

  async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      emailVerified: user.emailVerified,
      studentProfile: user.studentProfile,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await UserModel.findById(userId);
    if (!user || !user.passwordHash) {
      throw new AppError('User not found', 404);
    }

    const valid = await verifyPassword(user.passwordHash, oldPassword);
    if (!valid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const newHash = await hashPassword(newPassword);
    await UserModel.update(userId, { passwordHash: newHash });

    await AuditService.log({
      userId,
      action: 'user.change_password',
      resource: 'users',
      resourceId: userId,
    });
  },
};
