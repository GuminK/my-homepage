import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const { isAuthenticated, isSuperAdmin, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-600">My Homepage</Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">게시판</Link>
          <Link to="/notices" className="text-sm text-gray-600 hover:text-gray-900">공지사항</Link>
          {isAuthenticated && (
            <Link to="/chat" className="text-sm text-gray-600 hover:text-gray-900">채팅</Link>
          )}
          <Link to="/schedule" className="text-sm text-gray-600 hover:text-gray-900">합주 예약</Link>
          <Link to="/chord-sheets" className="text-sm text-gray-600 hover:text-gray-900">코드 악보</Link>
          <Link to="/chord" className="text-sm text-gray-600 hover:text-gray-900">전조기</Link>
          {isSuperAdmin && (
            <Link to="/admin" className="text-sm text-red-500 hover:text-red-700 font-medium">관리자</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/mypage" className="text-sm text-gray-600 hover:text-gray-900">
                {user?.nickname}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">로그인</Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
