import { EntityId, AggregateRoot, createDomainEvent } from '../../../shared/domain/entity.js';
import { Result, ok, err, ValidationError, ConflictError } from '../../../shared/domain/result.js';

export type StudentRecordStatus = 'imported' | 'invited' | 'activated' | 'archived';
export type StudentImportSource = 'manual' | 'table' | 'csv' | 'xlsx' | 'pdf' | 'image';

export interface StudentRecordProps {
  id: EntityId;
  institutionId: string;
  rollNumber: string;
  name: string;
  email?: string;
  program?: string;
  department?: string;
  cohort?: string;
  section?: string;
  phone?: string;
  status: StudentRecordStatus;
  source: StudentImportSource;
  userId?: string; // linked User after activation
  orgId: string;
  importedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentImportRecord {
  rollNumber: string;
  name: string;
  email?: string;
  program?: string;
  department?: string;
  cohort?: string;
  section?: string;
  phone?: string;
  source: StudentImportSource;
  confidence: number; // 0-1, for AI-extracted rows
  raw?: Record<string, unknown>;
}

export class StudentRecord extends AggregateRoot<EntityId> {
  readonly institutionId: string;
  readonly rollNumber: string;
  readonly orgId: string;
  private _name: string;
  private _email?: string;
  private _program?: string;
  private _department?: string;
  private _cohort?: string;
  private _section?: string;
  private _phone?: string;
  private _status: StudentRecordStatus;
  readonly source: StudentImportSource;
  private _userId?: string;
  readonly importedBy: string;

  constructor(props: StudentRecordProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.institutionId = props.institutionId;
    this.rollNumber = props.rollNumber.trim().toUpperCase();
    this._name = props.name;
    this._email = props.email?.toLowerCase().trim();
    this._program = props.program;
    this._department = props.department;
    this._cohort = props.cohort;
    this._section = props.section;
    this._phone = props.phone;
    this._status = props.status;
    this.source = props.source;
    this._userId = props.userId;
    this.orgId = props.orgId;
    this.importedBy = props.importedBy;
  }

  get name() { return this._name; }
  get email() { return this._email; }
  get program() { return this._program; }
  get department() { return this._department; }
  get cohort() { return this._cohort; }
  get section() { return this._section; }
  get phone() { return this._phone; }
  get status() { return this._status; }
  get userId() { return this._userId; }

  static validateImport(rec: StudentImportRecord): Result<void> {
    if (!rec.rollNumber || !rec.rollNumber.trim()) return err(new ValidationError('rollNumber required'));
    if (!rec.name || !rec.name.trim()) return err(new ValidationError('name required'));
    if (rec.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec.email)) return err(new ValidationError(`invalid email: ${rec.email}`));
    return ok(undefined);
  }

  update(fields: Partial<Pick<StudentRecordProps, 'name' | 'email' | 'program' | 'department' | 'cohort' | 'section' | 'phone'>>): Result<void> {
    if (fields.name !== undefined) this._name = fields.name;
    if (fields.email !== undefined) this._email = fields.email?.toLowerCase().trim();
    if (fields.program !== undefined) this._program = fields.program;
    if (fields.department !== undefined) this._department = fields.department;
    if (fields.cohort !== undefined) this._cohort = fields.cohort;
    if (fields.section !== undefined) this._section = fields.section;
    if (fields.phone !== undefined) this._phone = fields.phone;
    this.updatedAt = new Date();
    return ok(undefined);
  }

  invite(): Result<void> {
    if (this._status !== 'imported') return err(new ValidationError(`Cannot invite from ${this._status}`));
    this._status = 'invited';
    this.updatedAt = new Date();
    this.addDomainEvent(createDomainEvent({
      eventType: 'StudentInvited', aggregateId: this.id.toString(), aggregateType: 'StudentRecord',
      payload: { institutionId: this.institutionId, rollNumber: this.rollNumber, email: this._email }, orgId: this.orgId, version: this.version,
    }));
    return ok(undefined);
  }

  activate(userId: string): Result<void> {
    if (this._userId) return err(new ConflictError('Already activated'));
    if (!['imported', 'invited'].includes(this._status)) return err(new ValidationError(`Cannot activate from ${this._status}`));
    this._userId = userId;
    this._status = 'activated';
    this.updatedAt = new Date();
    this.addDomainEvent(createDomainEvent({
      eventType: 'StudentActivated', aggregateId: this.id.toString(), aggregateType: 'StudentRecord',
      payload: { institutionId: this.institutionId, rollNumber: this.rollNumber, userId }, orgId: this.orgId, version: this.version,
    }));
    return ok(undefined);
  }

  isActivated() { return this._status === 'activated' && !!this._userId; }
}
