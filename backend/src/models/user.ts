import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import type { User, StudentProfile } from '../types/index.js';

export function usersCollection() {
  return getCollection<User>('users');
}

export const UserModel = {
  async findById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    return usersCollection().findOne({ _id: new ObjectId(id), deletedAt: null });
  },

  async findByEmail(email: string): Promise<User | null> {
    return usersCollection().findOne({ email: email.toLowerCase(), deletedAt: null });
  },

  async findByGoogleId(googleId: string): Promise<User | null> {
    return usersCollection().findOne({ googleId, deletedAt: null });
  },

  async create(data: {
    email: string;
    passwordHash: string | null;
    name: string;
    role: User['role'];
    googleId?: string;
  }): Promise<User> {
    const now = new Date();
    const user: User = {
      _id: new ObjectId(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role,
      status: 'active',
      avatar: null,
      bio: null,
      phone: null,
      location: null,
      emailVerified: false,
      googleId: data.googleId ?? null,
      studentProfile: null,
      lastLoginAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await usersCollection().insertOne(user);
    return user;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    const result = await usersCollection().findOneAndUpdate(
      { _id: new ObjectId(id), deletedAt: null },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  },

  async updateLastLogin(id: string): Promise<void> {
    await usersCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLoginAt: new Date() } }
    );
  },

  async updateStudentProfile(id: string, profile: StudentProfile): Promise<User | null> {
    return UserModel.update(id, { studentProfile: profile });
  },

  async softDelete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await usersCollection().updateOne(
      { _id: new ObjectId(id), deletedAt: null },
      { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  },

  async findAll(page: number, limit: number, sort: string, order: 'asc' | 'desc'): Promise<{ items: User[]; total: number }> {
    const filter = { deletedAt: null };
    const total = await usersCollection().countDocuments(filter);
    const items = await usersCollection()
      .find(filter)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    return { items, total };
  },
};
