import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { postApi } from '@/api/postApi';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';

export default function PostListPage() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postApi.getPosts(),
  });

  const posts = data?.data.data.content ?? [];

  if (isLoading) return <div className="text-center py-10">불러오는 중...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시판</h1>
        {isAuthenticated && (
          <Link
            to="/posts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            글쓰기
          </Link>
        )}
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {posts.length === 0 ? (
          <p className="text-center py-10 text-gray-500">게시글이 없습니다.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">제목</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">작성자</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">작성일</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">조회수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/posts/${post.id}`} className="text-gray-900 hover:text-blue-600">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.author.nickname}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {dayjs(post.createdAt).format('YYYY.MM.DD')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{post.viewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
