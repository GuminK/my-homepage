import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

/** 모든 API 요청의 기본 설정 — baseURL, timeout, Content-Type */
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/** 요청 인터셉터 — Zustand 스토어에서 AccessToken을 꺼내 Authorization 헤더에 자동 첨부 */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** 응답 인터셉터 — 401 응답 시 로그아웃 처리 후 로그인 페이지로 리다이렉트 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
