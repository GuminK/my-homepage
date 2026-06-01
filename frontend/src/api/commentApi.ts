import api from './axios';
import type { ApiResponse, Comment } from '@/types';

interface CommentCreateRequest {
  content: string;
  parentId?: number; // 대댓글인 경우 부모 댓글 ID
}

interface CommentUpdateRequest {
  content: string;
}

export const commentApi = {
  /** 게시글의 댓글 목록 조회 */
  getComments: (postId: number) =>
    api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`),

  /** 댓글 또는 대댓글 작성 — parentId 있으면 대댓글 */
  createComment: (postId: number, data: CommentCreateRequest) =>
    api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, data),

  /** 댓글 수정 */
  updateComment: (postId: number, commentId: number, data: CommentUpdateRequest) =>
    api.put<ApiResponse<Comment>>(`/posts/${postId}/comments/${commentId}`, data),

  /** 댓글 삭제 */
  deleteComment: (postId: number, commentId: number) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),
};
