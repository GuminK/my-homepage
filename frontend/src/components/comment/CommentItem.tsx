import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/api/commentApi';
import { useAuthStore } from '@/store/authStore';
import type { Comment } from '@/types';
import CommentForm from './CommentForm';
import dayjs from 'dayjs';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  isReply?: boolean;
}

export default function CommentItem({ comment, postId, isReply = false }: CommentItemProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const isAuthor = user?.id === comment.author.id;

  const { mutate: deleteComment } = useMutation({
    mutationFn: () => commentApi.deleteComment(postId, comment.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  const { mutate: updateComment } = useMutation({
    mutationFn: (content: string) =>
      commentApi.updateComment(postId, comment.id, { content }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const { mutate: createReply } = useMutation({
    mutationFn: (content: string) =>
      commentApi.createComment(postId, { content, parentId: comment.id }),
    onSuccess: () => {
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return (
    <div className={isReply ? 'ml-8 mt-2' : 'mt-4'}>
      <div className="bg-gray-50 rounded p-3">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{comment.author.nickname}</span>
            <span>{dayjs(comment.createdAt).format('YYYY.MM.DD HH:mm')}</span>
          </div>
          {isAuthor && (
            <div className="flex gap-2 text-xs text-gray-400">
              <button onClick={() => setIsEditing(true)} className="hover:text-blue-500">
                수정
              </button>
              <button onClick={() => deleteComment()} className="hover:text-red-500">
                삭제
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <CommentForm
            initialValue={comment.content}
            submitLabel="수정"
            onSubmit={updateComment}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        )}
        {!isReply && user && !isEditing && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="mt-1 text-xs text-gray-400 hover:text-blue-500"
          >
            답글
          </button>
        )}
      </div>
      {isReplying && (
        <div className="ml-8 mt-2">
          <CommentForm
            placeholder="답글을 입력하세요"
            submitLabel="답글 등록"
            onSubmit={createReply}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} postId={postId} isReply />
      ))}
    </div>
  );
}
