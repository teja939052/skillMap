import { apiClient } from './client';
import type { ApiResponse, AuthTokens, AuthUser } from '@/types';

interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export const authApi = {
  async register(data: { email: string; password: string; name: string; role?: string }) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  async googleAuth(idToken: string) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/google', { idToken });
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return response.data;
  },
};
