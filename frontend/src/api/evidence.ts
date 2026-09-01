import { apiClient } from './client';
import type { ApiResponse, EvidenceResponse, PaginatedResponse, Pagination } from '@/types';

export const evidenceApi = {
  async getEvidence(params?: Pagination & { competencyId?: string; type?: string; status?: string }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<EvidenceResponse>>>('/evidence', { params });
    return response.data;
  },

  async getEvidenceById(id: string) {
    const response = await apiClient.get<ApiResponse<EvidenceResponse>>(`/evidence/${id}`);
    return response.data;
  },

  async createEvidence(data: Partial<EvidenceResponse>) {
    const response = await apiClient.post<ApiResponse<EvidenceResponse>>('/evidence', data);
    return response.data;
  },

  async updateEvidence(id: string, data: Partial<EvidenceResponse>) {
    const response = await apiClient.patch<ApiResponse<EvidenceResponse>>(`/evidence/${id}`, data);
    return response.data;
  },

  async deleteEvidence(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/evidence/${id}`);
    return response.data;
  },

  async verifyEvidence(id: string, data: { status: 'verified' | 'rejected'; notes?: string }) {
    const response = await apiClient.patch<ApiResponse<EvidenceResponse>>(`/evidence/${id}/verify`, data);
    return response.data;
  },
};
