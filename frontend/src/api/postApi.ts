import api from './axios';
import type { ApiResponse, PageResponse, Post } from '@/types';

interface PostCreateRequest { title: string; content: string; fileIds?: number[]; }

export const postApi = {
  getPosts: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<Post>>>('/posts', { params: { page, size } }),

  getPost: (postId: number) =>
    api.get<ApiResponse<Post>>(`/posts/${postId}`),

  createPost: (data: PostCreateRequest) =>
    api.post<ApiResponse<Post>>('/posts', data),

  updatePost: (postId: number, data: PostCreateRequest) =>
    api.put<ApiResponse<Post>>(`/posts/${postId}`, data),

  deletePost: (postId: number) =>
    api.delete(`/posts/${postId}`),

  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{ id: number; fileUrl: string }>>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
