import { apiClient } from './client';

export interface MatchItem {
  opportunityId: string;
  title: string;
  type: string;
  score: number;
  strengths: string[];
  gaps: string[];
  explanation?: {
    competencyScores: Array<{
      competencyId: string;
      requiredLevel: number;
      actualLevel: number;
      contribution: number;
      gap: number;
    }>;
  };
}

export const matchingApi = {
  async matchOpportunities() {
    const response = await apiClient.get('/matching/opportunities');
    return response.data;
  },

  async matchCandidates(opportunityId: string) {
    const response = await apiClient.get(`/matching/candidates/${opportunityId}`);
    return response.data;
  },

  async analyzeGaps(targetRole?: string) {
    const params: Record<string, string> = {};
    if (targetRole) params.targetRole = targetRole;
    const response = await apiClient.get('/matching/gaps', { params });
    return response.data;
  },
};
