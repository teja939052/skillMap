import { apiClient } from './client';
import type { ApiResponse, OpportunityResponse, ApplicationResponse, PaginatedResponse, Pagination } from '@/types';

export const opportunityApi = {
  async getOpportunities(params?: Pagination & { type?: string; status?: string; search?: string }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<OpportunityResponse>>>('/opportunities', { params });
    return response.data;
  },

  async getOpportunity(id: string) {
    const response = await apiClient.get<ApiResponse<OpportunityResponse>>(`/opportunities/${id}`);
    return response.data;
  },

  async createOpportunity(data: Partial<OpportunityResponse>) {
    const response = await apiClient.post<ApiResponse<OpportunityResponse>>('/opportunities', data);
    return response.data;
  },

  async updateOpportunity(id: string, data: Partial<OpportunityResponse>) {
    const response = await apiClient.patch<ApiResponse<OpportunityResponse>>(`/opportunities/${id}`, data);
    return response.data;
  },

  async applyToOpportunity(opportunityId: string, data: { coverLetter?: string; answers?: { question: string; answer: string }[] }) {
    const response = await apiClient.post<ApiResponse<ApplicationResponse>>(`/opportunities/${opportunityId}/apply`, data);
    return response.data;
  },

  async getApplications(params?: Pagination & { status?: string }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ApplicationResponse>>>('/applications', { params });
    return response.data;
  },

  async updateApplicationStatus(id: string, data: { status: string; notes?: string }) {
    const response = await apiClient.patch<ApiResponse<ApplicationResponse>>(`/applications/${id}`, data);
    return response.data;
  },

  async getMatchScore(opportunityId: string) {
    const response = await apiClient.get<ApiResponse<{ score: number; gaps: string[]; strengths: string[] }>>(`/opportunities/${opportunityId}/match`);
    return response.data;
  },
};
