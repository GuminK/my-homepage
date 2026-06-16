import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chordSheetApi } from '@/api/chordSheetApi';
import { useAuthStore } from '@/store/authStore';
import { transposeText } from '@/utils/transpose';
import dayjs from 'dayjs';

export default function ChordSheetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, isSuperAdmin } = useAuthStore();

  const [semitones, setSemitones] = useState(0);
  const [useFlats, setUseFlats] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['chord-sheets', id],
    queryFn: () => chordSheetApi.getById(Number(id)),
  });

  const { mutate: deleteSheet } = useMutation({
    mutationFn: () => chordSheetApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chord-sheets'] });
      navigate('/chord-sheets');
    },
  });

  if (isLoading) return <div className="text-center py-10">불러오는 중...</div>;

  const sheet = data?.data.data;
  if (!sheet) return null;

  const isAuthor = user?.id === sheet.author.id;
  const canDelete = isAuthor || isAdmin || isSuperAdmin;
  const keyLabel = semitones === 0 ? '원본' : `${semitones > 0 ? '+' : ''}${semitones}키`;
  const transposed = transposeText(sheet.content, semitones, useFlats);

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) deleteSheet();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 space-y-5">
        {/* 헤더 */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{sheet.title}</h1>
            <p className="text-gray-500 mt-1">{sheet.artist}</p>
          </div>
          {canDelete && (
            <div className="flex gap-2 shrink-0">
              {isAuthor && (
                <Link
                  to={`/chord-sheets/${id}/edit`}
                  className="text-sm px-3 py-1.5 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  수정
                </Link>
              )}
              <button
                onClick={handleDelete}
                className="text-sm px-3 py-1.5 border border-red-300 rounded-md text-red-500 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 메타 정보 */}
        <div className="flex gap-4 text-sm text-gray-500 border-t border-b py-3">
          <span>카포: <strong className="text-gray-700">{sheet.capo === 0 ? '없음' : `${sheet.capo}번`}</strong></span>
          <span>작성자: <strong className="text-gray-700">{sheet.author.nickname}</strong></span>
          <span>{dayjs(sheet.createdAt).format('YYYY.MM.DD')}</span>
        </div>

        {/* 전조 컨트롤 */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSemitones(s => s - 1)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold leading-none"
            >−</button>
            <span className="w-16 text-center font-semibold text-lg tabular-nums">{keyLabel}</span>
            <button
              onClick={() => setSemitones(s => s + 1)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold leading-none"
            >+</button>
          </div>
          <button
            onClick={() => setSemitones(0)}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            초기화
          </button>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={useFlats}
              onChange={e => setUseFlats(e.target.checked)}
              className="rounded"
            />
            플랫(♭) 표기
          </label>
        </div>

        {/* 코드 내용 */}
        <pre className="w-full border rounded-md px-4 py-3 font-mono text-sm bg-gray-50 whitespace-pre-wrap min-h-[120px] leading-relaxed">
          {transposed}
        </pre>

        <div>
          <Link to="/chord-sheets" className="text-sm text-gray-500 hover:text-gray-700">
            ← 목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
