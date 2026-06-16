import api from './axios';
import type { ApiResponse, ChordSheet, ChordSheetListItem } from '@/types';

interface ChordSheetCreateRequest {
  title: string;
  artist: string;
  content: string;
  capo: number;
}

export const chordSheetApi = {
  getList: () =>
    api.get<ApiResponse<ChordSheetListItem[]>>('/chord-sheets'),

  getById: (id: number) =>
    api.get<ApiResponse<ChordSheet>>(`/chord-sheets/${id}`),

  create: (data: ChordSheetCreateRequest) =>
    api.post<ApiResponse<ChordSheet>>('/chord-sheets', data),

  update: (id: number, data: ChordSheetCreateRequest) =>
    api.put<ApiResponse<ChordSheet>>(`/chord-sheets/${id}`, data),

  delete: (id: number) =>
    api.delete(`/chord-sheets/${id}`),
};
