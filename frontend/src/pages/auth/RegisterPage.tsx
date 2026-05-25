import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';

const registerSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다').max(20),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다').max(20),
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: signup, isPending } = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => navigate('/login'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
        <form onSubmit={handleSubmit((data) => signup(data))} className="space-y-4">
          {[
            { name: 'email' as const, label: '이메일', type: 'email' },
            { name: 'password' as const, label: '비밀번호', type: 'password' },
            { name: 'nickname' as const, label: '닉네임', type: 'text' },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                {...register(name)}
                type={type}
                className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? '처리 중...' : '회원가입'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
