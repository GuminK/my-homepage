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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isSuperAdmin: false,
      setAuth: (accessToken, user) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          isSuperAdmin: user.role === 'SUPER_ADMIN',
        }),
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
