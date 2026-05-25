import api from './axios';
import type { ApiResponse, Comment } from '@/types';

interface CommentCreateRequest {
  content: string;
  parentId?: number;
}

interface CommentUpdateRequest {
  content: string;
}

export const commentApi = {
  getComments: (postId: number) =>
    api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`),

  createComment: (postId: number, data: CommentCreateRequest) =>
    api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, data),

  updateComment: (postId: number, commentId: number, data: CommentUpdateRequest) =>
    api.put<ApiResponse<Comment>>(`/posts/${postId}/comments/${commentId}`, data),

  deleteComment: (postId: number, commentId: number) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),
};
