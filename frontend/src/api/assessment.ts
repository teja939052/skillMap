import { apiClient } from './client';
import type { ApiResponse, AssessmentResponse, AttemptResponse, AssessmentAttemptInput, PaginatedResponse, Pagination } from '@/types';

export const assessmentApi = {
  async getAssessments(params?: Pagination & { competencyId?: string; isPublished?: boolean }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AssessmentResponse>>>('/assessments', { params });
    return response.data;
  },

  async getAssessment(id: string) {
    const response = await apiClient.get<ApiResponse<AssessmentResponse>>(`/assessments/${id}`);
    return response.data;
  },

  async createAssessment(data: Partial<AssessmentResponse>) {
    const response = await apiClient.post<ApiResponse<AssessmentResponse>>('/assessments', data);
    return response.data;
  },

  async updateAssessment(id: string, data: Partial<AssessmentResponse>) {
    const response = await apiClient.patch<ApiResponse<AssessmentResponse>>(`/assessments/${id}`, data);
    return response.data;
  },

  async startAttempt(assessmentId: string) {
    const response = await apiClient.post<ApiResponse<{ attemptId: string }>>(`/assessments/${assessmentId}/start`);
    return response.data;
  },

  async submitAttempt(assessmentId: string, data: AssessmentAttemptInput) {
    const response = await apiClient.post<ApiResponse<AttemptResponse>>(`/assessments/${assessmentId}/submit`, data);
    return response.data;
  },

  async getAttempts(params?: Pagination) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AttemptResponse>>>('/assessments/attempts', { params });
    return response.data;
  },

  async getAttempt(id: string) {
    const response = await apiClient.get<ApiResponse<AttemptResponse>>(`/assessments/attempts/${id}`);
    return response.data;
  },
};
