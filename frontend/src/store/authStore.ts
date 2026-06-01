import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

/**
 * 인증 상태 전역 스토어 — localStorage에 persist되어 새로고침 후에도 로그인 유지.
 * accessToken은 api/axios.ts 인터셉터에서 자동으로 헤더에 첨부된다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isSuperAdmin: false,

      /** 로그인 성공 시 토큰과 사용자 정보 저장, 역할 플래그 세팅 */
      setAuth: (accessToken, user) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          isSuperAdmin: user.role === 'SUPER_ADMIN',
        }),

      /** 로그아웃 — 모든 인증 상태 초기화 (쿼리 캐시 초기화는 Header.tsx에서 수행) */
      logout: () =>
        set({ accessToken: null, user: null, isAuthenticated: false, isAdmin: false, isSuperAdmin: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isSuperAdmin: state.isSuperAdmin,
      }),
    }
  )
);
