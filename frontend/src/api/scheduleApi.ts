import api from './axios';
import type { ApiResponse } from '@/types';

export interface Schedule {
  id: number;
  userId: number;
  reserverName: string;
  songName: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface ScheduleCreateRequest {
  reserverName: string;
  songName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const scheduleApi = {
  /** 날짜 범위 내 일정 목록 조회 */
  getSchedules: (start: string, end: string) =>
    api.get<ApiResponse<Schedule[]>>('/schedules', { params: { start, end } }),

  /** 일정 예약 */
  createSchedule: (data: ScheduleCreateRequest) =>
    api.post<ApiResponse<Schedule>>('/schedules', data),

  /** 일정 수정 (관리자 전용) */
  updateSchedule: (id: number, data: ScheduleCreateRequest) =>
    api.put<ApiResponse<Schedule>>(`/schedules/${id}`, data),

  /** 일정 취소 */
  deleteSchedule: (id: number) =>
    api.delete(`/schedules/${id}`),
};
