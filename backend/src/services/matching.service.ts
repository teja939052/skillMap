import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database.js';
import { calculateMatchScore } from '@skill-map/utils';

export const MatchingService = {
  async calculateScore(userId: string, requirements: Array<{ competencyId: any; minLevel: number; weight: number }>) {
    if (requirements.length === 0) return 100;
    const evidenceCollection = getCollection('evidence');
    const evidence = await evidenceCollection
      .find({ ownerId: new ObjectId(userId), verificationStatus: 'verified', deletedAt: null })
      .toArray();

    const userComps = new Map<string, { level: number; confidence: number }>();
    for (const req of requirements) {
      const compEvidence = evidence.filter((e) => e.competencyId.toString() === req.competencyId.toString());
      if (compEvidence.length > 0) {
        const maxLevel = Math.max(...compEvidence.map((e) => e.proficiencyLevel));
        const avgConf = compEvidence.reduce((s, e) => s + (e.metadata.confidence as number || 0.7), 0) / compEvidence.length;
        userComps.set(req.competencyId.toString(), { level: maxLevel, confidence: avgConf });
      }
    }

    const result = calculateMatchScore(
      userComps,
      requirements.map((r) => ({ competencyId: r.competencyId.toString(), minLevel: r.minLevel, weight: r.weight }))
    );
    return result.score;
  },

  async matchOpportunities(userId: string, opportunities: any[]) {
    const results = await Promise.all(
      opportunities.map(async (opp) => ({
        opportunityId: opp.id,
        title: opp.title,
        type: opp.type,
        score: await this.calculateScore(userId, opp.requirements || []),
      }))
    );
    return results.sort((a, b) => b.score - a.score);
  },

  async matchCandidates(opportunityId: string, candidates: any[], requirements: any[]) {
    const results = await Promise.all(
      candidates.map(async (candidate) => ({
        userId: candidate.id,
        name: candidate.name,
        score: await this.calculateScore(candidate.id, requirements),
      }))
    );
    return results.sort((a, b) => b.score - a.score);
  },
};
