import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import PostListPage from '@/pages/post/PostListPage';
import PostDetailPage from '@/pages/post/PostDetailPage';
import PostCreatePage from '@/pages/post/PostCreatePage';
import PostEditPage from '@/pages/post/PostEditPage';
import NoticePage from '@/pages/notice/NoticePage';
import AdminPage from '@/pages/admin/AdminPage';
import ChatPage from '@/pages/chat/ChatPage';
import MyPage from '@/pages/mypage/MyPage';
import SchedulePage from '@/pages/schedule/SchedulePage';
import ChordPage from '@/pages/chord/ChordPage';
import ChordSheetListPage from '@/pages/chord/ChordSheetListPage';
import ChordSheetCreatePage from '@/pages/chord/ChordSheetCreatePage';
import ChordSheetDetailPage from '@/pages/chord/ChordSheetDetailPage';
import ChordSheetEditPage from '@/pages/chord/ChordSheetEditPage';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <PostListPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
      { path: 'notices', element: <NoticePage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'chord', element: <ChordPage /> },
      { path: 'chord-sheets', element: <ChordSheetListPage /> },
      { path: 'chord-sheets/:id', element: <ChordSheetDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'posts/new', element: <PostCreatePage /> },
          { path: 'posts/:id/edit', element: <PostEditPage /> },
          { path: 'chord-sheets/new', element: <ChordSheetCreatePage /> },
          { path: 'chord-sheets/:id/edit', element: <ChordSheetEditPage /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'chat/:roomId', element: <ChatPage /> },
          { path: 'admin', element: <AdminPage /> },
          { path: 'mypage', element: <MyPage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);
