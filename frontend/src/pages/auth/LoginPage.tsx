import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (res) => {
      const { accessToken } = res.data.data;
      // 토큰 저장 후 내 정보 조회
      useAuthStore.setState({ accessToken });
      const meRes = await authApi.getMe();
      setAuth(accessToken, meRes.data.data);
      navigate('/');
    },
    onError: () => {
      setError('password', { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← 홈으로</Link>
          <h1 className="text-2xl font-bold">로그인</h1>
          <div className="w-16" />
        </div>
        <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
