import api from './axios';
import type { ApiResponse } from '@/types';

export interface UserSummary {
  id: number;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}

export const adminApi = {
  getUsers: () => api.get<ApiResponse<UserSummary[]>>('/admin/users'),

  updateUserRole: (userId: number, role: 'USER' | 'ADMIN') =>
    api.patch<ApiResponse<UserSummary>>(`/admin/users/${userId}/role`, { role }),
};
