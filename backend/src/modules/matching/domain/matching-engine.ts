import { StudentCompetency } from '../../competency/domain/competency.js';
import { OpportunityRequirement } from '../../opportunity/domain/opportunity.js';
import { MatchExplanation } from '../../opportunity/domain/application.js';

export interface MatchInput {
  studentId: string;
  studentCompetencies: Array<{
    competencyId: string;
    proficiency: number;
    confidence: number;
  }>;
  requirements: OpportunityRequirement[];
  eligibility: {
    passed: boolean;
    reasons?: string[];
  };
  preferences?: {
    locationMatch?: boolean;
    remoteOk?: boolean;
  };
}

export interface MatchResult {
  score: number;
  rawScore: number;
  maxPossibleScore: number;
  competencyScores: MatchExplanation['competencyScores'];
  strengths: string[];
  gaps: string[];
  eligibilityPassed: boolean;
  explanation: MatchExplanation;
}

export interface RankingContext {
  algorithmVersion: string;
  recencyDecayFactor: number;
  evidenceConfidenceWeight: number;
  importanceMultipliers: {
    must_have: number;
    nice_to_have: number;
    bonus: number;
  };
}

export const DEFAULT_RANKING_CONTEXT: RankingContext = {
  algorithmVersion: 'v2.0',
  recencyDecayFactor: 0.95,
  evidenceConfidenceWeight: 0.3,
  importanceMultipliers: {
    must_have: 3.0,
    nice_to_have: 1.5,
    bonus: 0.5,
  },
};

export class MatchingEngine {
  constructor(private readonly context: RankingContext = DEFAULT_RANKING_CONTEXT) {}

  calculateMatch(input: MatchInput): MatchResult {
    const {
      studentCompetencies,
      requirements,
      eligibility,
    } = input;

    if (!eligibility.passed) {
      return this.buildIneligibleResult(input);
    }

    const studentMap = new Map(
      studentCompetencies.map((sc) => [sc.competencyId, sc])
    );

    const competencyScores: MatchExplanation['competencyScores'] = [];
    let totalScore = 0;
    let maxPossibleScore = 0;
    const strengths: string[] = [];
    const gaps: string[] = [];

    for (const req of requirements) {
      const studentComp = studentMap.get(req.competencyId);
      const importanceMult = this.context.importanceMultipliers[req.importance];

      const actualLevel = studentComp?.proficiency ?? 0;
      const confidence = studentComp?.confidence ?? 0;

      let contribution: number;
      let gap: number;

      if (!studentComp) {
        contribution = 0;
        gap = req.targetLevel;
        gaps.push(req.competencyId);
      } else {
        const levelScore = Math.min(1, actualLevel / req.targetLevel);
        const confidenceBonus = confidence * this.context.evidenceConfidenceWeight;
        contribution = (levelScore + confidenceBonus) * importanceMult * req.weight;
        gap = Math.max(0, req.targetLevel - actualLevel);

        if (actualLevel >= req.targetLevel) {
          strengths.push(req.competencyId);
        } else if (gap > 0) {
          gaps.push(req.competencyId);
        }
      }

      const maxContribution = (1 + this.context.evidenceConfidenceWeight) * importanceMult * req.weight;
      totalScore += contribution;
      maxPossibleScore += maxContribution;

      competencyScores.push({
        competencyId: req.competencyId,
        requiredLevel: req.targetLevel,
        actualLevel,
        contribution: Math.round(contribution * 100) / 100,
        gap,
      });
    }

    const normalizedScore = maxPossibleScore > 0
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 0;

    const score = Math.min(100, Math.max(0, normalizedScore));

    const explanation: MatchExplanation = {
      score,
      competencyScores,
      strengths,
      gaps,
      eligibilityPassed: true,
      calculatedAt: new Date(),
      algorithmVersion: this.context.algorithmVersion,
    };

    return {
      score,
      rawScore: totalScore,
      maxPossibleScore,
      competencyScores,
      strengths,
      gaps,
      eligibilityPassed: true,
      explanation,
    };
  }

  rankCandidates(
    candidates: MatchInput[]
  ): MatchResult[] {
    return candidates
      .map((c) => ({ input: c, result: this.calculateMatch(c) }))
      .sort((a, b) => b.result.score - a.result.score)
      .map((r) => r.result);
  }

  private buildIneligibleResult(input: MatchInput): MatchResult {
    return {
      score: 0,
      rawScore: 0,
      maxPossibleScore: 0,
      competencyScores: [],
      strengths: [],
      gaps: input.requirements.map((r) => r.competencyId),
      eligibilityPassed: false,
      explanation: {
        score: 0,
        competencyScores: [],
        strengths: [],
        gaps: input.requirements.map((r) => r.competencyId),
        eligibilityPassed: false,
        calculatedAt: new Date(),
        algorithmVersion: this.context.algorithmVersion,
      },
    };
  }
}

export interface GapAnalysis {
  competencyId: string;
  competencyName?: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  importance: 'must_have' | 'nice_to_have' | 'bonus';
  priority: number;
  recommendation?: string;
}

export function analyzeGaps(
  studentCompetencies: Array<{ competencyId: string; proficiency: number; confidence: number }>,
  requirements: Array<OpportunityRequirement & { competencyName?: string }>
): GapAnalysis[] {
  const studentMap = new Map(
    studentCompetencies.map((sc) => [sc.competencyId, sc])
  );

  return requirements
    .map((req) => {
      const studentComp = studentMap.get(req.competencyId);
      const currentLevel = studentComp?.proficiency ?? 0;
      const gap = Math.max(0, req.targetLevel - currentLevel);
      const importanceWeight = req.importance === 'must_have' ? 3 : req.importance === 'nice_to_have' ? 1.5 : 0.5;
      const priority = gap * importanceWeight * req.weight;

      return {
        competencyId: req.competencyId,
        competencyName: req.competencyName,
        currentLevel,
        targetLevel: req.targetLevel,
        gap,
        importance: req.importance,
        priority,
        recommendation: gap > 0 ? `Improve from ${currentLevel} to ${req.targetLevel}` : undefined,
      };
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.priority - a.priority);
}
