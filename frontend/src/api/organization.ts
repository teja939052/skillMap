import { apiClient } from './client';
import type { ApiResponse, OrganizationResponse, PaginatedResponse, Pagination, InviteMemberInput } from '@/types';

export const organizationApi = {
  async getOrganizations(params?: Pagination) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<OrganizationResponse>>>('/organizations', { params });
    return response.data;
  },

  async getOrganization(id: string) {
    const response = await apiClient.get<ApiResponse<OrganizationResponse>>(`/organizations/${id}`);
    return response.data;
  },

  async createOrganization(data: Partial<OrganizationResponse>) {
    const response = await apiClient.post<ApiResponse<OrganizationResponse>>('/organizations', data);
    return response.data;
  },

  async updateOrganization(id: string, data: Partial<OrganizationResponse>) {
    const response = await apiClient.patch<ApiResponse<OrganizationResponse>>(`/organizations/${id}`, data);
    return response.data;
  },

  async inviteMember(orgId: string, data: InviteMemberInput) {
    const response = await apiClient.post<ApiResponse<null>>(`/organizations/${orgId}/members`, data);
    return response.data;
  },

  async removeMember(orgId: string, userId: string) {
    const response = await apiClient.delete<ApiResponse<null>>(`/organizations/${orgId}/members/${userId}`);
    return response.data;
  },
};
