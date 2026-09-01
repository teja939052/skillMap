import { EventBus, EventHandler, Outbox } from './types.js';
import { DomainEvent } from '../domain/entity.js';

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private outbox?: Outbox;

  setOutbox(outbox: Outbox): void {
    this.outbox = outbox;
  }

  register<T extends DomainEvent>(handler: EventHandler<T>): void {
    const existing = this.handlers.get(handler.eventType) || [];
    existing.push(handler as EventHandler);
    this.handlers.set(handler.eventType, existing);
  }

  async publish(event: DomainEvent): Promise<void> {
    if (this.outbox) {
      await this.outbox.store(event);
    }
    const handlers = this.handlers.get(event.eventType) || [];
    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (err) {
        console.error(`[EventBus] Handler error for ${event.eventType}:`, err);
      }
    }
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}

export class OutboxPublisher {
  private interval: NodeJS.Timeout | null = null;

  constructor(
    private readonly outbox: Outbox,
    private readonly eventBus: EventBus,
    private readonly intervalMs = 5000
  ) {}

  start(): void {
    this.interval = setInterval(async () => {
      await this.processBatch();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async processBatch(): Promise<void> {
    const records = await this.outbox.getUnpublished(100);
    for (const record of records) {
      try {
        await this.eventBus.publish(record.event);
        await this.outbox.markPublished(record.id);
      } catch (err) {
        await this.outbox.markFailed(
          record.id,
          err instanceof Error ? err.message : 'Unknown error'
        );
      }
    }
  }
}
