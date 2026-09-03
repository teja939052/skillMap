import { apiClient } from './client';
import type { ApiResponse } from '@/types';

export interface FreelanceTask {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: Array<{ competencyId: string; minLevel: number; weight: number }>;
  payout: number;
  currency: string;
  estimatedHours: number;
  deadline?: string;
  postedBy: string;
  orgId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export const freelanceApi = {
  async list(params?: Record<string, unknown>) {
    const response = await apiClient.get<ApiResponse<{ items: FreelanceTask[]; total: number }>>('/freelance', { params });
    return response.data;
  },
  async matched(skills: Array<{ competencyId: string; proficiency: number; confidence: number }>, limit = 10) {
    const response = await apiClient.get<ApiResponse<{ items: FreelanceTask[]; total: number }>>('/freelance/matched', {
      params: { skills: JSON.stringify(skills), limit },
    });
    return response.data;
  },
  async get(id: string) {
    const response = await apiClient.get<ApiResponse<FreelanceTask>>(`/freelance/${id}`);
    return response.data;
  },
};
