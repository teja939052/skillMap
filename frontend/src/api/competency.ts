import { apiClient } from './client';
import type { ApiResponse, CompetencyResponse, RoleBlueprintResponse, PaginatedResponse, Pagination } from '@/types';

export const competencyApi = {
  async getCompetencies(params?: Pagination & { type?: string; domain?: string; search?: string }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CompetencyResponse>>>('/competencies', { params });
    return response.data;
  },

  async getCompetency(id: string) {
    const response = await apiClient.get<ApiResponse<CompetencyResponse>>(`/competencies/${id}`);
    return response.data;
  },

  async createCompetency(data: Partial<CompetencyResponse>) {
    const response = await apiClient.post<ApiResponse<CompetencyResponse>>('/competencies', data);
    return response.data;
  },

  async updateCompetency(id: string, data: Partial<CompetencyResponse>) {
    const response = await apiClient.patch<ApiResponse<CompetencyResponse>>(`/competencies/${id}`, data);
    return response.data;
  },

  async deleteCompetency(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/competencies/${id}`);
    return response.data;
  },

  async getRoleBlueprints(params?: Pagination) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RoleBlueprintResponse>>>('/role-blueprints', { params });
    return response.data;
  },

  async getRoleBlueprint(id: string) {
    const response = await apiClient.get<ApiResponse<RoleBlueprintResponse>>(`/role-blueprints/${id}`);
    return response.data;
  },

  async createRoleBlueprint(data: Partial<RoleBlueprintResponse>) {
    const response = await apiClient.post<ApiResponse<RoleBlueprintResponse>>('/role-blueprints', data);
    return response.data;
  },

  async updateRoleBlueprint(id: string, data: Partial<RoleBlueprintResponse>) {
    const response = await apiClient.patch<ApiResponse<RoleBlueprintResponse>>(`/role-blueprints/${id}`, data);
    return response.data;
  },
};
