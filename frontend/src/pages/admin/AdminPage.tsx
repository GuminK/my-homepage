import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type UserSummary } from '@/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import dayjs from 'dayjs';

const ROLE_LABEL: Record<string, string> = {
  USER: '일반회원',
  ADMIN: '관리자',
  SUPER_ADMIN: '슈퍼관리자',
};

export default function AdminPage() {
  const { isSuperAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
  });

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'USER' | 'ADMIN' }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users: UserSummary[] = data?.data.data ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-6">회원 관리</h1>
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">불러오는 중...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">이메일</th>
                <th className="pb-3 pr-4">닉네임</th>
                <th className="pb-3 pr-4">역할</th>
                <th className="pb-3 pr-4">가입일</th>
                <th className="pb-3">변경</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-400">{u.id}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">{u.nickname}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {dayjs(u.createdAt).format('YYYY.MM.DD')}
                  </td>
                  <td className="py-3">
                    {u.role === 'SUPER_ADMIN' ? (
                      <span className="text-gray-300 text-xs">-</span>
                    ) : u.role === 'ADMIN' ? (
                      <button
                        onClick={() => changeRole({ userId: u.id, role: 'USER' })}
                        className="px-2 py-1 text-xs border rounded text-gray-600 hover:bg-gray-100"
                      >
                        일반회원으로 변경
                      </button>
                    ) : (
                      <button
                        onClick={() => changeRole({ userId: u.id, role: 'ADMIN' })}
                        className="px-2 py-1 text-xs border rounded text-red-600 border-red-300 hover:bg-red-50"
                      >
                        관리자로 변경
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
