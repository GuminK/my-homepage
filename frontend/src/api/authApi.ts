import api from './axios';
import type { ApiResponse, User } from '@/types';

interface LoginRequest { email: string; password: string; }
interface SignupRequest { email: string; password: string; nickname: string; }
interface TokenResponse { accessToken: string; refreshToken: string; tokenType: string; }

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<TokenResponse>>('/auth/login', data),

  signup: (data: SignupRequest) =>
    api.post<ApiResponse<void>>('/auth/signup', data),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),
};
