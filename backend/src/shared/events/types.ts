import { DomainEvent } from '../domain/entity.js';

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishMany(events: DomainEvent[]): Promise<void>;
}

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  eventType: string;
  handle(event: T): Promise<void>;
}

export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByOrg(orgId: string, after?: Date, limit?: number): Promise<DomainEvent[]>;
}

export interface OutboxRecord {
  id: string;
  event: DomainEvent;
  published: boolean;
  attempts: number;
  createdAt: Date;
  publishedAt?: Date;
  error?: string;
}

export interface Outbox {
  store(event: DomainEvent): Promise<void>;
  getUnpublished(batchSize?: number): Promise<OutboxRecord[]>;
  markPublished(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
