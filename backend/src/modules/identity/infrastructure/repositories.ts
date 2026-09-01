import { Repository } from '../../../shared/persistence/repository.js';
import { User, Membership, RefreshSession } from '../domain/user.js';
import { EntityId } from '../../../shared/domain/entity.js';

export interface UserDocument {
  _id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  emailVerified: boolean;
  googleId?: string;
  passwordHash?: string;
  lastLoginAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class UserRepository extends Repository<UserDocument> {
  protected collectionName = 'users';

  async findUserById(id: string): Promise<User | null> {
    const doc = await super.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.findOne({ email: email.toLowerCase() } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await this.findOne({ googleId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async save(user: User): Promise<void> {
    const doc = this.toDocument(user);
    await this.collection.updateOne(
      { _id: user.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: UserDocument): User {
    return new User({
      id: EntityId.fromString(doc._id.toString()),
      email: doc.email,
      name: doc.name,
      role: doc.role as any,
      status: doc.status as any,
      avatar: doc.avatar,
      bio: doc.bio,
      phone: doc.phone,
      location: doc.location,
      emailVerified: doc.emailVerified,
      googleId: doc.googleId,
      passwordHash: doc.passwordHash,
      lastLoginAt: doc.lastLoginAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(user: User): UserDocument {
    return {
      _id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      emailVerified: user.emailVerified,
      googleId: user.googleId,
      passwordHash: user.passwordHash,
      lastLoginAt: user.lastLoginAt,
      version: user.version,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: null,
    };
  }
}

export interface MembershipDocument {
  _id: string;
  userId: string;
  organizationId: string;
  role: string;
  department?: string;
  status: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

export class MembershipRepository extends Repository<MembershipDocument> {
  protected collectionName = 'memberships';

  async findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null> {
    const doc = await this.findOne({ userId, organizationId } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUser(userId: string): Promise<Membership[]> {
    const docs = await this.find({ userId, status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async findByOrg(organizationId: string): Promise<Membership[]> {
    const docs = await this.find({ organizationId, status: 'active' } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(membership: Membership): Promise<void> {
    const doc = this.toDocument(membership);
    await this.collection.updateOne(
      { _id: membership.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: MembershipDocument): Membership {
    return new Membership({
      id: EntityId.fromString(doc._id.toString()),
      userId: doc.userId,
      organizationId: doc.organizationId,
      role: doc.role as any,
      department: doc.department,
      status: doc.status as any,
      joinedAt: doc.joinedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(m: Membership): MembershipDocument {
    return {
      _id: m.id.toString(),
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role,
      department: m.department,
      status: m.status,
      joinedAt: m.joinedAt,
      version: 0,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: null,
    };
  }
}

export interface RefreshSessionDocument {
  _id: string;
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class RefreshSessionRepository extends Repository<RefreshSessionDocument> {
  protected collectionName = 'refresh_sessions';
  protected softDelete = false;

  async findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    const doc = await this.findOne({ tokenHash } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUser(userId: string): Promise<RefreshSession[]> {
    const docs = await this.find({ userId } as any);
    return docs.map((d) => this.toEntity(d));
  }

  async save(session: RefreshSession): Promise<void> {
    const doc = this.toDocument(session);
    await this.collection.updateOne(
      { _id: session.id.toString() } as any,
      { $set: doc },
      { upsert: true }
    );
  }

  private toEntity(doc: RefreshSessionDocument): RefreshSession {
    return new RefreshSession({
      id: EntityId.fromString(doc._id.toString()),
      userId: doc.userId,
      tokenHash: doc.tokenHash,
      deviceInfo: doc.deviceInfo,
      ipAddress: doc.ipAddress,
      expiresAt: doc.expiresAt,
      revokedAt: doc.revokedAt,
      createdAt: doc.createdAt,
    });
  }

  private toDocument(s: RefreshSession): RefreshSessionDocument {
    return {
      _id: s.id.toString(),
      userId: s.userId,
      tokenHash: s.tokenHash,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      expiresAt: s.expiresAt,
      revokedAt: s.revokedAt,
      version: s.version,
      status: s.revokedAt ? 'revoked' : 'active',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      deletedAt: null,
    };
  }
}
