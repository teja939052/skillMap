import { apiClient } from './client';

export interface MissionStep {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'assess' | 'project' | 'verify';
  order: number;
  evidenceRequired: boolean;
  estimatedMinutes: number;
}

export interface SkillMission {
  competencyId: string;
  competencyName: string;
  title: string;
  description: string;
  steps: MissionStep[];
  status: string;
  currentStep: number;
  targetLevel: number;
}

export const missionsApi = {
  async getMyMissions() {
    const response = await apiClient.get('/missions/mine');
    return response.data;
  },

  async generateMissions(gaps: Array<{ competencyId: string; competencyName?: string; gap: number; importance: string }>, orgId?: string) {
    const response = await apiClient.post('/missions/generate', { gaps, orgId });
    return response.data;
  },

  async advanceMission(competencyId: string) {
    const response = await apiClient.post(`/missions/${encodeURIComponent(competencyId)}/advance`);
    return response.data;
  },
};
