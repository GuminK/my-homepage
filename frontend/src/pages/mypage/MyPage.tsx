import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다').max(20, '닉네임은 20자 이하여야 합니다'),
});

type FormData = z.infer<typeof schema>;

export default function MyPage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: user?.nickname ?? '' },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: FormData) => authApi.updateNickname(data.nickname),
    onSuccess: (res) => {
      // 스토어의 user 정보 갱신
      if (accessToken) {
        setAuth(accessToken, res.data.data);
      }
      setSuccessMsg('닉네임이 변경되었습니다.');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* 현재 정보 */}
        <div className="space-y-2 text-sm text-gray-600">
          <div><span className="font-medium text-gray-900">이메일</span>: {user?.email}</div>
          <div><span className="font-medium text-gray-900">현재 닉네임</span>: {user?.nickname}</div>
          <div><span className="font-medium text-gray-900">역할</span>: {user?.role}</div>
        </div>

        <hr />

        {/* 닉네임 수정 폼 */}
        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <h2 className="text-lg font-semibold">닉네임 변경</h2>

          <div>
            <input
              {...register('nickname')}
              placeholder="새 닉네임 입력"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nickname && (
              <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {(error as any)?.response?.data?.message ?? '닉네임 변경에 실패했습니다.'}
            </p>
          )}
          {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? '변경 중...' : '닉네임 변경'}
          </button>
        </form>
      </div>
    </div>
  );
}
