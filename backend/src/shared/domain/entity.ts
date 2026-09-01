export class EntityId {
  private constructor(private readonly value: string) {}

  static create(value?: string): EntityId {
    return new EntityId(value ?? crypto.randomUUID());
  }

  static fromString(value: string): EntityId {
    return new EntityId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }
}

export class AggregateRoot<TId extends EntityId> {
  readonly id: TId;
  readonly createdAt: Date;
  updatedAt: Date;
  version: number = 0;
  private domainEvents: DomainEvent[] = [];

  constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  getDomainEvents(): ReadonlyArray<DomainEvent> {
    return this.domainEvents;
  }
}

export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
  readonly orgId?: string;
  readonly actorId?: string;
  readonly traceId?: string;
  readonly causationId?: string;
  readonly version: number;
}

export function createDomainEvent(params: {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, unknown>;
  orgId?: string;
  actorId?: string;
  traceId?: string;
  causationId?: string;
  version?: number;
}): DomainEvent {
  return {
    eventId: crypto.randomUUID(),
    eventType: params.eventType,
    aggregateId: params.aggregateId,
    aggregateType: params.aggregateType,
    occurredAt: new Date(),
    payload: params.payload,
    orgId: params.orgId,
    actorId: params.actorId,
    traceId: params.traceId,
    causationId: params.causationId,
    version: params.version ?? 1,
  };
}
