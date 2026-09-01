import { randomUUID } from 'node:crypto';

export function generateId(): string {
  return randomUUID();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function paginate<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export function calculatePages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

export function round(value: number, decimals = 2): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isExpired(date: Date | string): boolean {
  return new Date(date) < new Date();
}

export function daysSince(date: Date | string): number {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function calculateEvidenceConfidence(
  evidenceQuality: number,
  recencyDays: number,
  verifierTrust: number,
  consistencyFactor: number
): number {
  const recencyFactor = Math.max(0, 1 - recencyDays / 180);
  return clamp(round(evidenceQuality * recencyFactor * verifierTrust * consistencyFactor), 0, 1);
}

export function calculateCompetencyProficiency(
  scores: Array<{ level: number; weight: number; confidence: number }>
): number {
  if (scores.length === 0) return 0;
  const totalWeight = scores.reduce((sum, s) => sum + s.weight * s.confidence, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = scores.reduce((sum, s) => sum + s.level * s.weight * s.confidence, 0);
  return clamp(round(weightedSum / totalWeight, 1), 0, 5);
}

export function calculateMatchScore(
  userCompetencies: Map<string, { level: number; confidence: number }>,
  requirements: Array<{ competencyId: string; minLevel: number; weight: number }>
): { score: number; gaps: string[]; strengths: string[] } {
  if (requirements.length === 0) return { score: 100, gaps: [], strengths: [] };

  let totalWeight = 0;
  let weightedScore = 0;
  const gaps: string[] = [];
  const strengths: string[] = [];

  for (const req of requirements) {
    totalWeight += req.weight;
    const userComp = userCompetencies.get(req.competencyId);

    if (!userComp) {
      gaps.push(req.competencyId);
      continue;
    }

    const levelScore = Math.min(1, userComp.level / req.minLevel);
    const fitScore = levelScore * userComp.confidence;
    weightedScore += fitScore * req.weight;

    if (userComp.level >= req.minLevel) {
      strengths.push(req.competencyId);
    } else {
      gaps.push(req.competencyId);
    }
  }

  const score = totalWeight > 0 ? clamp(round((weightedScore / totalWeight) * 100), 0, 100) : 0;
  return { score, gaps, strengths };
}
