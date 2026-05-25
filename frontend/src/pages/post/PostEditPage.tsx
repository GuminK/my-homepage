import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postApi } from '@/api/postApi';

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  content: z.string().min(1, '내용을 입력해주세요'),
});
type PostForm = z.infer<typeof postSchema>;

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postApi.getPost(Number(id)),
  });

  const post = data?.data.data;

  const { register, handleSubmit, formState: { errors } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    values: post ? { title: post.title, content: post.content } : undefined,
  });

  const { mutate: updatePost, isPending } = useMutation({
    mutationFn: (data: PostForm) => postApi.updatePost(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate(`/posts/${id}`);
    },
  });

  if (isLoading) return <div className="text-center py-10">불러오는 중...</div>;
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-6">글 수정</h1>
        <form onSubmit={handleSubmit((data) => updatePost(data))} className="space-y-4">
          <div>
            <input
              {...register('title')}
              placeholder="제목"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <textarea
              {...register('content')}
              placeholder="내용을 입력하세요"
              rows={15}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
