import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chordSheetApi } from '@/api/chordSheetApi';

const schema = z.object({
  title: z.string().min(1, '곡 제목을 입력해주세요').max(200),
  artist: z.string().min(1, '아티스트를 입력해주세요').max(100),
  content: z.string().min(1, '코드를 입력해주세요'),
  capo: z.number().min(0).max(11),
});
type FormValues = z.infer<typeof schema>;

export default function ChordSheetEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['chord-sheets', id],
    queryFn: () => chordSheetApi.getById(Number(id)),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { capo: 0 },
  });

  useEffect(() => {
    const sheet = data?.data.data;
    if (sheet) {
      reset({ title: sheet.title, artist: sheet.artist, content: sheet.content, capo: sheet.capo });
    }
  }, [data, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => chordSheetApi.update(Number(id), values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chord-sheets'] });
      navigate(`/chord-sheets/${id}`);
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-6">코드 악보 수정</h1>
        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">곡 제목</label>
              <input
                {...register('title')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아티스트</label>
              <input
                {...register('artist')}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.artist && <p className="text-red-500 text-sm mt-1">{errors.artist.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카포 <span className="text-gray-400 font-normal">(없으면 0)</span>
            </label>
            <input
              {...register('capo', { valueAsNumber: true })}
              type="number"
              min={0}
              max={11}
              className="w-24 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">코드</label>
            <textarea
              {...register('content')}
              rows={12}
              className="w-full border rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
