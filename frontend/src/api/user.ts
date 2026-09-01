import { apiClient } from './client';
import type { ApiResponse, UserResponse, StudentProfile, UpdateUserInput, PaginatedResponse, Pagination } from '@/types';

export const userApi = {
  async getProfile() {
    const response = await apiClient.get<ApiResponse<UserResponse>>('/users/me');
    return response.data;
  },

  async updateProfile(data: UpdateUserInput) {
    const response = await apiClient.patch<ApiResponse<UserResponse>>('/users/me', data);
    return response.data;
  },

  async getStudentProfile() {
    const response = await apiClient.get<ApiResponse<StudentProfile>>('/users/me/student-profile');
    return response.data;
  },

  async updateStudentProfile(data: Partial<StudentProfile>) {
    const response = await apiClient.patch<ApiResponse<StudentProfile>>('/users/me/student-profile', data);
    return response.data;
  },

  async getUsers(params?: Pagination & { role?: string; status?: string; search?: string }) {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<UserResponse>>>('/users', { params });
    return response.data;
  },

  async getUserById(id: string) {
    const response = await apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return response.data;
  },

  async updateUserStatus(id: string, status: string) {
    const response = await apiClient.patch<ApiResponse<UserResponse>>(`/users/${id}/status`, { status });
    return response.data;
  },
};
