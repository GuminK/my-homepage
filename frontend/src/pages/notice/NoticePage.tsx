import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import type { ApiResponse, PageResponse, Notice } from '@/types';
import dayjs from 'dayjs';

type EditForm = { title: string; content: string; pinned: boolean };

export default function NoticePage() {
  const { isAdmin, isSuperAdmin } = useAuthStore();
  const canWriteNotice = isAdmin || isSuperAdmin;
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EditForm>({ title: '', content: '', pinned: false });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', content: '', pinned: false });

  const { data, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api.get<ApiResponse<PageResponse<Notice>>>('/notices'),
  });

  const { mutate: createNotice } = useMutation({
    mutationFn: () => api.post('/notices', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setShowForm(false);
      setForm({ title: '', content: '', pinned: false });
    },
  });

  const { mutate: updateNotice } = useMutation({
    mutationFn: (id: number) => api.put(`/notices/${id}`, editForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setEditingId(null);
    },
  });

  const { mutate: deleteNotice } = useMutation({
    mutationFn: (id: number) => api.delete(`/notices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setExpandedId(null);
    },
  });

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setEditForm({ title: notice.title, content: notice.content, pinned: notice.pinned });
    setExpandedId(notice.id);
  };

  const notices = data?.data.data.content ?? [];

  if (isLoading) return <div className="text-center py-10">불러오는 중...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">공지사항</h1>
        {canWriteNotice && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
          >
            공지 작성
          </button>
        )}
      </div>

      {showForm && canWriteNotice && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목"
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="내용"
            rows={4}
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
            />
            상단 고정
          </label>
          <button onClick={() => createNotice()} className="bg-blue-600 text-white px-4 py-2 rounded">
            등록
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-lg shadow">
            <button
              onClick={() => {
                if (editingId === notice.id) return;
                setExpandedId(expandedId === notice.id ? null : notice.id);
              }}
              className="w-full text-left p-4"
            >
              <div className="flex items-center gap-2">
                {notice.pinned && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-medium">고정</span>
                )}
                <h3 className="font-medium flex-1">{notice.title}</h3>
                {canWriteNotice && (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => startEdit(notice)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('공지사항을 삭제하시겠습니까?')) deleteNotice(notice.id);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                )}
                <span className="text-gray-400 text-sm">{expandedId === notice.id ? '▲' : '▼'}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {notice.author.nickname} · {dayjs(notice.createdAt).format('YYYY.MM.DD')}
              </p>
            </button>

            {expandedId === notice.id && (
              <div className="px-4 pb-4 border-t pt-3">
                {editingId === notice.id ? (
                  <div>
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full border rounded px-3 py-2 mb-2 text-sm"
                    />
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={4}
                      className="w-full border rounded px-3 py-2 mb-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-sm mb-3">
                      <input
                        type="checkbox"
                        checked={editForm.pinned}
                        onChange={(e) => setEditForm({ ...editForm, pinned: e.target.checked })}
                      />
                      상단 고정
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateNotice(notice.id)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="border px-3 py-1.5 rounded text-sm text-gray-600"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
