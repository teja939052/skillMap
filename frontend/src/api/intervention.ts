import { apiClient } from './client';
import type { ApiResponse, InterventionResponse, PaginatedResponse, Pagination } from '@/types';

export const interventionApi = {
  async getInterventions(params?: Pagination & { type?: string; status?: string }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<InterventionResponse>>>('/interventions', { params });
    return response.data;
  },

  async getIntervention(id: string) {
    const response = await apiClient.get<ApiResponse<InterventionResponse>>(`/interventions/${id}`);
    return response.data;
  },

  async createIntervention(data: Partial<InterventionResponse>) {
    const response = await apiClient.post<ApiResponse<InterventionResponse>>('/interventions', data);
    return response.data;
  },

  async updateIntervention(id: string, data: Partial<InterventionResponse>) {
    const response = await apiClient.patch<ApiResponse<InterventionResponse>>(`/interventions/${id}`, data);
    return response.data;
  },

  async enrollInIntervention(interventionId: string) {
    const response = await apiClient.post<ApiResponse<null>>(`/interventions/${interventionId}/enroll`);
    return response.data;
  },

  async unenrollFromIntervention(interventionId: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/interventions/${interventionId}/enroll`);
    return response.data;
  },

  async getOutcomes(interventionId: string) {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`/interventions/${interventionId}/outcomes`);
    return response.data;
  },
};
