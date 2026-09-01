import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MatchingEngine, DEFAULT_RANKING_CONTEXT, analyzeGaps } from '../../modules/matching/domain/matching-engine.js';
import { CompetencyScoringEngine, DEFAULT_SCORING_CONTEXT } from '../../modules/competency/domain/scoring-engine.js';
import { isValidTransition, APPLICATION_TRANSITIONS, EVIDENCE_TRANSITIONS, OPPORTUNITY_TRANSITIONS } from './value-objects.js';
import { EntityId, createDomainEvent } from './entity.js';
import { Result, ok, err, InvariantError, NotFoundError, ConflictError } from './result.js';

describe('MatchingEngine', () => {
  let engine: MatchingEngine;

  beforeEach(() => {
    engine = new MatchingEngine(DEFAULT_RANKING_CONTEXT);
  });

  describe('calculateMatch', () => {
    it('returns 100 for perfect match', () => {
      const result = engine.calculateMatch({
        studentId: 's1',
        studentCompetencies: [
          { competencyId: 'c1', proficiency: 80, confidence: 0.9 },
          { competencyId: 'c2', proficiency: 70, confidence: 0.8 },
        ],
        requirements: [
          { competencyId: 'c1', targetLevel: 70, importance: 'must_have', weight: 1 },
          { competencyId: 'c2', targetLevel: 60, importance: 'nice_to_have', weight: 1 },
        ],
        eligibility: { passed: true },
      });
      expect(result.score).toBeGreaterThan(80);
      expect(result.strengths).toContain('c1');
      expect(result.strengths).toContain('c2');
    });

    it('returns 0 for ineligible candidates', () => {
      const result = engine.calculateMatch({
        studentId: 's1',
        studentCompetencies: [],
        requirements: [{ competencyId: 'c1', targetLevel: 70, importance: 'must_have', weight: 1 }],
        eligibility: { passed: false, reasons: ['GPA too low'] },
      });
      expect(result.score).toBe(0);
      expect(result.eligibilityPassed).toBe(false);
    });

    it('identifies gaps correctly', () => {
      const result = engine.calculateMatch({
        studentId: 's1',
        studentCompetencies: [{ competencyId: 'c1', proficiency: 40, confidence: 0.6 }],
        requirements: [{ competencyId: 'c1', targetLevel: 80, importance: 'must_have', weight: 1 }],
        eligibility: { passed: true },
      });
      expect(result.gaps).toContain('c1');
      expect(result.score).toBeLessThan(60);
    });

    it('includes versioned explanation', () => {
      const result = engine.calculateMatch({
        studentId: 's1',
        studentCompetencies: [{ competencyId: 'c1', proficiency: 70, confidence: 0.8 }],
        requirements: [{ competencyId: 'c1', targetLevel: 70, importance: 'must_have', weight: 1 }],
        eligibility: { passed: true },
      });
      expect(result.explanation.algorithmVersion).toBe('v2.0');
      expect(result.explanation.calculatedAt).toBeInstanceOf(Date);
    });
  });

  describe('rankCandidates', () => {
    it('ranks candidates by score descending', () => {
      const candidates = [
        {
          studentId: 's1',
          studentCompetencies: [{ competencyId: 'c1', proficiency: 50, confidence: 0.5 }],
          requirements: [{ competencyId: 'c1', targetLevel: 80, importance: 'must_have' as const, weight: 1 }],
          eligibility: { passed: true },
        },
        {
          studentId: 's2',
          studentCompetencies: [{ competencyId: 'c1', proficiency: 90, confidence: 0.9 }],
          requirements: [{ competencyId: 'c1', targetLevel: 80, importance: 'must_have' as const, weight: 1 }],
          eligibility: { passed: true },
        },
      ];
      const results = engine.rankCandidates(candidates);
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });
  });
});

describe('CompetencyScoringEngine', () => {
  let engine: CompetencyScoringEngine;

  beforeEach(() => {
    engine = new CompetencyScoringEngine(DEFAULT_SCORING_CONTEXT);
  });

  describe('calculateProficiency', () => {
    it('returns 0 for empty evidence', () => {
      const result = engine.calculateProficiency([]);
      expect(result.proficiency).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.evidenceCount).toBe(0);
    });

    it('weights verified evidence higher than pending (mixed levels)', () => {
      // Single evidence same level cannot differentiate proficiency — test with mixed pair
      const verifiedHigh = engine.calculateProficiency([
        { proficiencyLevel: 90, confidence: 0.9, recencyDays: 0, verificationWeight: 1.5, evidenceTypeWeight: 1.0 },
        { proficiencyLevel: 50, confidence: 0.9, recencyDays: 0, verificationWeight: 0.7, evidenceTypeWeight: 1.0 },
      ]);
      const pendingHigh = engine.calculateProficiency([
        { proficiencyLevel: 90, confidence: 0.9, recencyDays: 0, verificationWeight: 0.7, evidenceTypeWeight: 1.0 },
        { proficiencyLevel: 50, confidence: 0.9, recencyDays: 0, verificationWeight: 1.5, evidenceTypeWeight: 1.0 },
      ]);
      expect(verifiedHigh.proficiency).toBeGreaterThan(pendingHigh.proficiency);
    });

    it('applies recency decay (mixed levels)', () => {
      const recentHigh = engine.calculateProficiency([
        { proficiencyLevel: 90, confidence: 0.9, recencyDays: 0, verificationWeight: 1.0, evidenceTypeWeight: 1.0 },
        { proficiencyLevel: 50, confidence: 0.9, recencyDays: 365, verificationWeight: 1.0, evidenceTypeWeight: 1.0 },
      ]);
      const oldHigh = engine.calculateProficiency([
        { proficiencyLevel: 90, confidence: 0.9, recencyDays: 365, verificationWeight: 1.0, evidenceTypeWeight: 1.0 },
        { proficiencyLevel: 50, confidence: 0.9, recencyDays: 0, verificationWeight: 1.0, evidenceTypeWeight: 1.0 },
      ]);
      expect(recentHigh.proficiency).toBeGreaterThan(oldHigh.proficiency);
    });
  });
});

describe('State Machines', () => {
  describe('APPLICATION_TRANSITIONS', () => {
    it('allows valid transitions', () => {
      expect(isValidTransition('applied', 'under_review', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('under_review', 'shortlisted', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('shortlisted', 'interview', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('interview', 'offered', APPLICATION_TRANSITIONS)).toBe(true);
      expect(isValidTransition('offered', 'accepted', APPLICATION_TRANSITIONS)).toBe(true);
    });

    it('rejects invalid transitions', () => {
      expect(isValidTransition('applied', 'accepted', APPLICATION_TRANSITIONS)).toBe(false);
      expect(isValidTransition('rejected', 'shortlisted', APPLICATION_TRANSITIONS)).toBe(false);
      expect(isValidTransition('accepted', 'rejected', APPLICATION_TRANSITIONS)).toBe(false);
    });
  });

  describe('EVIDENCE_TRANSITIONS', () => {
    it('allows pending to verified', () => {
      expect(isValidTransition('pending', 'verified', EVIDENCE_TRANSITIONS)).toBe(true);
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

    it('rejects draft to closed', () => {
      expect(isValidTransition('draft', 'closed', OPPORTUNITY_TRANSITIONS)).toBe(false);
    });
  });
});

describe('Domain Primitives', () => {
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
      expect(id1.equals(id2)).toBe(true);
    });
  });

  describe('createDomainEvent', () => {
    it('creates event with all fields', () => {
      const event = createDomainEvent({
        eventType: 'TestEvent',
        aggregateId: 'agg-1',
        aggregateType: 'Test',
        payload: { key: 'value' },
        orgId: 'org-1',
        actorId: 'user-1',
      });
      expect(event.eventType).toBe('TestEvent');
      expect(event.aggregateId).toBe('agg-1');
      expect(event.eventId).toBeDefined();
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.version).toBe(1);
    });
  });
});

describe('Result type', () => {
  it('ok returns success', () => {
    const result = ok(42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(42);
  });

  it('err returns failure', () => {
    const result = err(new InvariantError('test'));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toBe('test');
  });
});

describe('analyzeGaps', () => {
  it('identifies and prioritizes gaps', () => {
    const gaps = analyzeGaps(
      [
        { competencyId: 'c1', proficiency: 40, confidence: 0.6 },
        { competencyId: 'c2', proficiency: 80, confidence: 0.9 },
      ],
      [
        { competencyId: 'c1', targetLevel: 80, importance: 'must_have', weight: 1, competencyName: 'Docker' },
        { competencyId: 'c2', targetLevel: 60, importance: 'nice_to_have', weight: 1, competencyName: 'AWS' },
      ]
    );
    expect(gaps.length).toBe(1);
    expect(gaps[0].competencyId).toBe('c1');
    expect(gaps[0].gap).toBe(40);
    expect(gaps[0].priority).toBeGreaterThan(0);
  });

  it('returns empty when no gaps', () => {
    const gaps = analyzeGaps(
      [{ competencyId: 'c1', proficiency: 90, confidence: 0.9 }],
      [{ competencyId: 'c1', targetLevel: 70, importance: 'must_have', weight: 1 }]
    );
    expect(gaps.length).toBe(0);
  });
});
