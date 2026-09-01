import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, UnauthorizedError, ConflictError, InvariantError } from '../../../shared/domain/result.js';
import { UserRole, MEMBERSHIP_ROLES } from '../../../shared/domain/value-objects.js';

export interface UserProps {
  id: EntityId;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  emailVerified: boolean;
  googleId?: string;
  passwordHash?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<EntityId> {
  readonly email: string;
  private _name: string;
  readonly role: UserRole;
  private _status: string;
  private _avatar?: string;
  private _bio?: string;
  private _phone?: string;
  private _location?: string;
  private _emailVerified: boolean;
  private _googleId?: string;
  private _passwordHash?: string;
  private _lastLoginAt?: Date;

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.email = props.email;
    this._name = props.name;
    this.role = props.role;
    this._status = props.status;
    this._avatar = props.avatar;
    this._bio = props.bio;
    this._phone = props.phone;
    this._location = props.location;
    this._emailVerified = props.emailVerified;
    this._googleId = props.googleId;
    this._passwordHash = props.passwordHash;
    this._lastLoginAt = props.lastLoginAt;
  }

  get name(): string { return this._name; }
  get status(): string { return this._status; }
  get avatar(): string | undefined { return this._avatar; }
  get bio(): string | undefined { return this._bio; }
  get phone(): string | undefined { return this._phone; }
  get location(): string | undefined { return this._location; }
  get emailVerified(): boolean { return this._emailVerified; }
  get googleId(): string | undefined { return this._googleId; }
  get passwordHash(): string | undefined { return this._passwordHash; }
  get lastLoginAt(): Date | undefined { return this._lastLoginAt; }

  setPassword(hash: string): void {
    this._passwordHash = hash;
    this.updatedAt = new Date();
  }

  linkGoogle(googleId: string): Result<void> {
    if (this._googleId) {
      return err(new ConflictError('Google account already linked'));
    }
    this._googleId = googleId;
    this.updatedAt = new Date();
    return ok(undefined);
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(
      createDomainEvent({
        eventType: 'UserLoggedIn',
        aggregateId: this.id.toString(),
        aggregateType: 'User',
        payload: { userId: this.id.toString(), email: this.email, role: this.role },
        version: this.version,
      })
    );
  }

  verifyEmail(): Result<void> {
    if (this._emailVerified) {
      return err(new InvariantError('Email already verified'));
    }
    this._emailVerified = true;
    this._status = 'active';
    this.updatedAt = new Date();
    return ok(undefined);
  }

  suspend(): Result<void> {
    if (this._status === 'suspended') {
      return err(new InvariantError('User is already suspended'));
    }
    this._status = 'suspended';
    this.updatedAt = new Date();
    return ok(undefined);
  }

  activate(): Result<void> {
    if (this._status === 'active') {
      return err(new InvariantError('User is already active'));
    }
    this._status = 'active';
    this.updatedAt = new Date();
    return ok(undefined);
  }

  canAuthenticate(): boolean {
    return this._status === 'active' || this._status === 'pending_verification';
  }

  updateProfile(updates: { name?: string; bio?: string; phone?: string; location?: string; avatar?: string }): void {
    if (updates.name) this._name = updates.name;
    if (updates.bio !== undefined) this._bio = updates.bio;
    if (updates.phone !== undefined) this._phone = updates.phone;
    if (updates.location !== undefined) this._location = updates.location;
    if (updates.avatar !== undefined) this._avatar = updates.avatar;
    this.updatedAt = new Date();
  }
}

export interface MembershipProps {
  id: EntityId;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  department?: string;
  status: 'active' | 'suspended' | 'removed';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Membership extends AggregateRoot<EntityId> {
  readonly userId: string;
  readonly organizationId: string;
  private _role: MembershipRole;
  readonly department?: string;
  private _status: string;
  readonly joinedAt: Date;

  constructor(props: MembershipProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.userId = props.userId;
    this.organizationId = props.organizationId;
    this._role = props.role;
    this.department = props.department;
    this._status = props.status;
    this.joinedAt = props.joinedAt;
  }

  get role(): MembershipRole { return this._role; }
  get status(): string { return this._status; }

  changeRole(newRole: MembershipRole): Result<void> {
    if (this._role === newRole) return err(new InvariantError('Role is already the same'));
    const oldRole = this._role;
    this._role = newRole;
    this.updatedAt = new Date();
    this.addDomainEvent(createDomainEvent({
      eventType: 'MembershipRoleChanged',
      aggregateId: this.id.toString(),
      aggregateType: 'Membership',
      payload: { membershipId: this.id.toString(), userId: this.userId, organizationId: this.organizationId, oldRole, newRole },
      version: this.version,
    }));
    return ok(undefined);
  }

  suspend(): Result<void> {
    if (this._status !== 'active') return err(new InvariantError('Can only suspend active memberships'));
    this._status = 'suspended';
    this.updatedAt = new Date();
    return ok(undefined);
  }

  remove(): Result<void> {
    if (this._status === 'removed') return err(new InvariantError('Membership is already removed'));
    this._status = 'removed';
    this.updatedAt = new Date();
    this.addDomainEvent(createDomainEvent({
      eventType: 'MembershipRemoved',
      aggregateId: this.id.toString(),
      aggregateType: 'Membership',
      payload: { membershipId: this.id.toString(), userId: this.userId, organizationId: this.organizationId },
      version: this.version,
    }));
    return ok(undefined);
  }

  isActive(): boolean { return this._status === 'active'; }
}

export interface RefreshSessionProps {
  id: EntityId;
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

export class RefreshSession extends AggregateRoot<EntityId> {
  readonly userId: string;
  readonly tokenHash: string;
  readonly deviceInfo?: string;
  readonly ipAddress?: string;
  readonly expiresAt: Date;
  private _revokedAt?: Date;

  constructor(props: RefreshSessionProps) {
    super(props.id, props.createdAt, props.createdAt);
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.deviceInfo = props.deviceInfo;
    this.ipAddress = props.ipAddress;
    this.expiresAt = props.expiresAt;
    this._revokedAt = props.revokedAt;
  }

  get revokedAt(): Date | undefined { return this._revokedAt; }
  revoke(): void { this._revokedAt = new Date(); this.updatedAt = new Date(); }
  isValid(): boolean { return !this._revokedAt && this.expiresAt > new Date(); }
}

export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];
