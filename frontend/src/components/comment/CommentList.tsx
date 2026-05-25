import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/api/commentApi';
import { useAuthStore } from '@/store/authStore';
import type { Comment } from '@/types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentApi.getComments(postId),
  });

  const { mutate: createComment } = useMutation({
    mutationFn: (content: string) => commentApi.createComment(postId, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  const comments: Comment[] = data?.data.data ?? [];

  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-lg font-semibold mb-4">댓글 {comments.length}개</h3>
      {user && (
        <div className="mb-6">
          <CommentForm onSubmit={createComment} />
        </div>
      )}
      {isLoading ? (
        <div className="text-sm text-gray-500">댓글 불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-gray-500 py-4 text-center">첫 댓글을 남겨보세요.</div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
