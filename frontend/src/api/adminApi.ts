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
  /** 전체 사용자 목록 조회 (SUPER_ADMIN 전용) */
  getUsers: () => api.get<ApiResponse<UserSummary[]>>('/admin/users'),

  /** 사용자 역할 변경 — USER ↔ ADMIN 전환 가능, SUPER_ADMIN으로는 변경 불가 */
  updateUserRole: (userId: number, role: 'USER' | 'ADMIN') =>
    api.patch<ApiResponse<UserSummary>>(`/admin/users/${userId}/role`, { role }),
};
