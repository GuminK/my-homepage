import api from './axios';
import type { ApiResponse, PageResponse, Post } from '@/types';

interface PostCreateRequest { title: string; content: string; fileIds?: number[]; }

export const postApi = {
  /** 게시글 목록 조회 (페이지네이션) */
  getPosts: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<Post>>>('/posts', { params: { page, size } }),

  /** 게시글 단건 조회 — 조회 시 조회수 증가 */
  getPost: (postId: number) =>
    api.get<ApiResponse<Post>>(`/posts/${postId}`),

  /** 게시글 작성 — fileIds로 이미 업로드된 파일 연결 가능 */
  createPost: (data: PostCreateRequest) =>
    api.post<ApiResponse<Post>>('/posts', data),

  /** 게시글 수정 */
  updatePost: (postId: number, data: PostCreateRequest) =>
    api.put<ApiResponse<Post>>(`/posts/${postId}`, data),

  /** 게시글 삭제 */
  deletePost: (postId: number) =>
    api.delete(`/posts/${postId}`),

  /** 파일 업로드 — multipart/form-data로 전송, 반환된 fileId를 게시글 작성 시 사용 */
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{ id: number; fileUrl: string }>>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
