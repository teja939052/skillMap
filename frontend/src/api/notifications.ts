import { apiClient } from './client';
import type { ApiResponse } from '@/types';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'opportunity_match' | 'freelance_match' | 'application_update' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  async list(params?: { limit?: number; unread?: boolean }) {
    const response = await apiClient.get<ApiResponse<{ items: AppNotification[]; unread: number }>>('/notifications', { params });
    return response.data;
  },
  async unreadCount() {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },
  async markRead(id: string) {
    const response = await apiClient.patch<ApiResponse<{ success: boolean }>>(`/notifications/${id}/read`);
    return response.data;
  },
  async markAllRead() {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/notifications/read-all');
    return response.data;
  },
};
