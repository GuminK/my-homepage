import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { postApi } from '@/api/postApi';
import { useAuthStore } from '@/store/authStore';
import CommentList from '@/components/comment/CommentList';
import dayjs from 'dayjs';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postApi.getPost(Number(id)),
    staleTime: 0,
  });

  useEffect(() => {
    if (data) {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  }, [data, queryClient]);

  const { mutate: deletePost } = useMutation({
    mutationFn: () => postApi.deletePost(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/');
    },
  });

  if (isLoading) return <div className="text-center py-10">불러오는 중...</div>;
  const post = data?.data.data;
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  const isAuthor = user?.id === post.author.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-6 pb-4 border-b">
          <div className="flex gap-4">
            <span>{post.author.nickname}</span>
            <span>{dayjs(post.createdAt).format('YYYY.MM.DD HH:mm')}</span>
            <span>조회 {post.viewCount}</span>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <Link to={`/posts/${post.id}/edit`} className="text-blue-500 hover:underline">수정</Link>
              <button onClick={() => deletePost()} className="text-red-500 hover:underline">삭제</button>
            </div>
          )}
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.attachments?.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">첨부파일</h3>
            {post.attachments.map((file) => {
              const url = file.fileUrl.startsWith('/') ? `http://localhost:9000${file.fileUrl}` : file.fileUrl;
              if (file.fileType === 'IMAGE') {
                return (
                  <div key={file.id} className="mt-2">
                    <img src={url} alt={file.originalName} className="max-w-full rounded" />
                    <a href={url} className="block text-blue-500 hover:underline text-sm mt-1">{file.originalName}</a>
                  </div>
                );
              }
              if (file.fileType === 'VIDEO') {
                return (
                  <div key={file.id} className="mt-2">
                    <video controls className="max-w-full max-h-96 rounded">
                      <source src={url} />
                    </video>
                    <a href={url} className="block text-blue-500 hover:underline text-sm mt-1">{file.originalName}</a>
                  </div>
                );
              }
              return (
                <a key={file.id} href={url} className="block text-blue-500 hover:underline text-sm">
                  {file.originalName}
                </a>
              );
            })}
          </div>
        )}
        <CommentList postId={post.id} />
      </div>
    </div>
  );
}
