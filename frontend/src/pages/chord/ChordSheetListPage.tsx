import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { chordSheetApi } from '@/api/chordSheetApi';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';

export default function ChordSheetListPage() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['chord-sheets'],
    queryFn: () => chordSheetApi.getList(),
  });

  const sheets = data?.data.data ?? [];

  if (isLoading) return <div className="text-center py-10">불러오는 중...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">코드 악보</h1>
        {isAuthenticated && (
          <Link
            to="/chord-sheets/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            악보 올리기
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sheets.length === 0 ? (
          <p className="text-center py-10 text-gray-500">등록된 코드 악보가 없습니다.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">곡 제목</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">아티스트</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">카포</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">작성자</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sheets.map((sheet) => (
                <tr key={sheet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/chord-sheets/${sheet.id}`} className="text-gray-900 hover:text-blue-600 font-medium">
                      {sheet.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sheet.artist}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {sheet.capo === 0 ? '없음' : `${sheet.capo}번`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sheet.author.nickname}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {dayjs(sheet.createdAt).format('YYYY.MM.DD')}
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
