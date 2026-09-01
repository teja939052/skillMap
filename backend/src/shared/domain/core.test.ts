import { describe, it, expect, beforeEach } from 'vitest';
import { EntityId, createDomainEvent, AggregateRoot } from './entity.js';
import { Result, ok, err, InvariantError, ValidationError, NotFoundError, ForbiddenError, ConflictError } from './result.js';
import {
  isValidTransition, APPLICATION_TRANSITIONS, EVIDENCE_TRANSITIONS,
  OPPORTUNITY_TRANSITIONS, INTERVENTION_TRANSITIONS, EVIDENCE_TRANSITIONS as EVIDENCE_TRANSITIONS_2,
  scoreToBand, ProficiencyLevel
} from './value-objects.js';

describe('Result type', () => {
  it('ok returns success with value', () => {
    const result = ok(42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(42);
  });

  it('err returns failure with error', () => {
    const result = err(new InvariantError('test error'));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('test error');
      expect(result.error.code).toBe('INVARIANT_VIOLATION');
    }
  });

  it('ok with undefined value', () => {
    const result = ok(undefined);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBeUndefined();
  });

  it('err with different error types', () => {
    const ve = err(new ValidationError('field required', { field: 'email' }));
    if (!ve.success) expect(ve.error.code).toBe('VALIDATION_ERROR');

    const nf = err(new NotFoundError('User', '123'));
    if (!nf.success) expect(nf.error.code).toBe('NOT_FOUND');

    const fb = err(new ForbiddenError('Cannot access'));
    if (!fb.success) expect(fb.error.code).toBe('FORBIDDEN');

    const ce = err(new ConflictError('Duplicate'));
    if (!ce.success) expect(ce.error.code).toBe('CONFLICT');
  });
});

describe('EntityId', () => {
  it('creates unique IDs', () => {
    const id1 = EntityId.create();
    const id2 = EntityId.create();
    expect(id1.toString()).not.toBe(id2.toString());
  });

  it('creates from string', () => {
    const id = EntityId.fromString('test-123');
    expect(id.toString()).toBe('test-123');
  });

  it('checks equality', () => {
    const id1 = EntityId.fromString('test');
    const id2 = EntityId.fromString('test');
    const id3 = EntityId.fromString('other');
    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });

  it('toString returns the value', () => {
    const id = EntityId.fromString('my-id');
    expect(id.toString()).toBe('my-id');
  });
});

describe('createDomainEvent', () => {
  it('creates event with all required fields', () => {
    const event = createDomainEvent({
      eventType: 'TestEvent',
      aggregateId: 'agg-1',
      aggregateType: 'Test',
      payload: { key: 'value' },
    });
    expect(event.eventType).toBe('TestEvent');
    expect(event.aggregateId).toBe('agg-1');
    expect(event.aggregateType).toBe('Test');
    expect(event.payload).toEqual({ key: 'value' });
    expect(event.eventId).toBeDefined();
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.version).toBe(1);
  });

  it('creates event with optional fields', () => {
    const event = createDomainEvent({
      eventType: 'UserLoggedIn',
      aggregateId: 'user-1',
      aggregateType: 'User',
      payload: {},
      orgId: 'org-1',
      actorId: 'admin-1',
      traceId: 'trace-123',
      causationId: 'cause-456',
      version: 3,
    });
    expect(event.orgId).toBe('org-1');
    expect(event.actorId).toBe('admin-1');
    expect(event.traceId).toBe('trace-123');
    expect(event.causationId).toBe('cause-456');
    expect(event.version).toBe(3);
  });

  it('generates unique event IDs', () => {
    const e1 = createDomainEvent({ eventType: 'T', aggregateId: 'a', aggregateType: 'A', payload: {} });
    const e2 = createDomainEvent({ eventType: 'T', aggregateId: 'a', aggregateType: 'A', payload: {} });
    expect(e1.eventId).not.toBe(e2.eventId);
  });
});

describe('State Machines', () => {
  describe('APPLICATION_TRANSITIONS', () => {
    it('allows valid forward transitions', () => {
      expect(isValidTransition('applied', 'under_review', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('under_review', 'shortlisted', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('shortlisted', 'interview', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('interview', 'offered', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('offered', 'accepted', APPLICATION_TRANSITIONS)).toBe(true);
    });

    it('allows withdrawal from active states', () => {
      expect(isValidTransition('applied', 'withdrawn', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('under_review', 'withdrawn', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('shortlisted', 'withdrawn', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('interview', 'withdrawn', APPLICATION_TRANSITIONS)).toBe(true);
    });

    it('rejects skipping states', () => {
      expect(isValidTransition('applied', 'accepted', APPLICATION_TRANSITIONS)).toBe(false);
      expect(isValidTransition('applied', 'shortlisted', APPLICATION_TRANSITIONS)).toBe(false);
      expect(isValidTransition('under_review', 'offered', APPLICATION_TRANSITIONS)).toBe(false);
    });

    it('rejects transitions from terminal states', () => {
      expect(isValidTransition('accepted', 'rejected', APPLICATION_TRANSITIONS)).toBe(false);
      expect(isValidTransition('rejected', 'shortlisted', APPLICATION_TRANSITIONS)).toBe(false);
      expect(isValidTransition('withdrawn', 'applied', APPLICATION_TRANSITIONS)).toBe(false);
    });
  });

  describe('EVIDENCE_TRANSITIONS', () => {
    it('allows pending to verified', () => {
      expect(isValidTransition('pending', 'verified', EVIDENCE_TRANSITIONS)).toBe(true);
    });

    it('allows pending to rejected', () => {
      expect(isValidTransition('pending', 'rejected', EVIDENCE_TRANSITIONS)).toBe(true);
    });

    it('allows verified to superseded', () => {
      expect(isValidTransition('verified', 'superseded', EVIDENCE_TRANSITIONS)).toBe(true);
    });

    it('rejects rejected to verified', () => {
      expect(isValidTransition('rejected', 'verified', EVIDENCE_TRANSITIONS)).toBe(false);
    });
  });

  describe('OPPORTUNITY_TRANSITIONS', () => {
    it('allows draft to open', () => {
      expect(isValidTransition('draft', 'open', OPPORTUNITY_TRANSITIONS)).toBe(true);
    });

    it('allows open to closed', () => {
      expect(isValidTransition('open', 'closed', OPPORTUNITY_TRANSITIONS)).toBe(true);
    });

    it('rejects draft to closed', () => {
      expect(isValidTransition('draft', 'closed', OPPORTUNITY_TRANSITIONS)).toBe(false);
    });

    it('rejects archived to open', () => {
      expect(isValidTransition('archived', 'open', OPPORTUNITY_TRANSITIONS)).toBe(false);
    });
  });

  describe('INTERVENTION_TRANSITIONS', () => {
    it('allows draft to active', () => {
      expect(isValidTransition('draft', 'active', INTERVENTION_TRANSITIONS)).toBe(true);
    });

    it('allows active to completed', () => {
      expect(isValidTransition('active', 'completed', INTERVENTION_TRANSITIONS)).toBe(true);
    });

    it('allows cancellation from any non-terminal state', () => {
      expect(isValidTransition('draft', 'cancelled', INTERVENTION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('active', 'cancelled', INTERVENTION_TRANSITIONS)).toBe(true);
    });

    it('rejects completed to active', () => {
      expect(isValidTransition('completed', 'active', INTERVENTION_TRANSITIONS)).toBe(false);
    });
  });
});

describe('scoreToBand', () => {
  it('returns awareness for 0-24', () => {
    expect(scoreToBand(0)).toBe('awareness');
    expect(scoreToBand(12)).toBe('awareness');
    expect(scoreToBand(24)).toBe('awareness');
  });

  it('returns foundation for 25-49', () => {
    expect(scoreToBand(25)).toBe('foundation');
    expect(scoreToBand(37)).toBe('foundation');
    expect(scoreToBand(49)).toBe('foundation');
  });

  it('returns working for 50-69', () => {
    expect(scoreToBand(50)).toBe('working');
    expect(scoreToBand(60)).toBe('working');
    expect(scoreToBand(69)).toBe('working');
  });

  it('returns proficient for 70-84', () => {
    expect(scoreToBand(70)).toBe('proficient');
    expect(scoreToBand(77)).toBe('proficient');
    expect(scoreToBand(84)).toBe('proficient');
  });

  it('returns advanced for 85-94', () => {
    expect(scoreToBand(85)).toBe('advanced');
    expect(scoreToBand(90)).toBe('advanced');
    expect(scoreToBand(94)).toBe('advanced');
  });

  it('returns expert for 95-100', () => {
    expect(scoreToBand(95)).toBe('expert');
    expect(scoreToBand(100)).toBe('expert');
  });
});

describe('AggregateRoot', () => {
  class TestEntity extends AggregateRoot<EntityId> {
    constructor(id: EntityId) {
      super(id);
    }
  }

  it('has id, createdAt, updatedAt', () => {
    const id = EntityId.create();
    const entity = new TestEntity(id);
    expect(entity.id).toBe(id);
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('starts with version 0', () => {
    const entity = new TestEntity(EntityId.create());
    expect(entity.version).toBe(0);
  });

  it('manages domain events', () => {
    const entity = new TestEntity(EntityId.create());
    const event = createDomainEvent({
      eventType: 'Test',
      aggregateId: entity.id.toString(),
      aggregateType: 'TestEntity',
      payload: {},
    });
    entity.addDomainEvent(event);
    expect(entity.getDomainEvents()).toHaveLength(1);
    entity.clearDomainEvents();
    expect(entity.getDomainEvents()).toHaveLength(0);
  });
});
