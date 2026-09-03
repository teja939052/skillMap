import { apiClient } from './client';

export interface SkillGraphNode {
  competencyId: string;
  name: string;
  type: string;
  childIds: string[];
  targetRoleIds: string[];
  domain: string;
  difficulty: number;
  estimatedHours: number;
  prerequisites: string[];
}

export interface LearningPathStep {
  competencyId: string;
  name: string;
  status: 'ready' | 'partial' | 'missing';
  currentLevel: number;
  targetLevel: number;
  estimatedHours: number;
  prerequisites: string[];
  order: number;
}

export const skillGraphApi = {
  async getGraph(domain?: string) {
    const params: Record<string, string> = {};
    if (domain) params.domain = domain;
    const response = await apiClient.get('/skill-graph', { params });
    return response.data;
  },

  async getRoleTargets(roleId: string) {
    const response = await apiClient.get(`/skill-graph/role/${roleId}`);
    return response.data;
  },

  async getLearningPath(skills: string[], targetRoleId?: string) {
    const params: Record<string, string> = { targetRoleId: targetRoleId || '' };
    if (skills.length) params.skills = skills.join(',');
    const response = await apiClient.get('/skill-graph/missions/me', { params });
    return response.data;
  },
};
