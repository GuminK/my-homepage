import api from './axios';
import type { ApiResponse, User } from '@/types';

interface LoginRequest { email: string; password: string; }
interface SignupRequest { email: string; password: string; nickname: string; }
interface TokenResponse { accessToken: string; refreshToken: string; tokenType: string; }

export const authApi = {
  /** 로그인 — AccessToken, RefreshToken 반환 */
  login: (data: LoginRequest) =>
    api.post<ApiResponse<TokenResponse>>('/auth/login', data),

  /** 회원가입 */
  signup: (data: SignupRequest) =>
    api.post<ApiResponse<void>>('/auth/signup', data),

  /** 내 프로필 조회 */
  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),
};
