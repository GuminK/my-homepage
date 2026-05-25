import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '@/api/postApi';

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  content: z.string().min(1, '내용을 입력해주세요'),
});
type PostForm = z.infer<typeof postSchema>;

export default function PostCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFileIds, setUploadedFileIds] = useState<number[]>([]);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  });

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: (data: PostForm) =>
      postApi.createPost({ ...data, fileIds: uploadedFileIds }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate(`/posts/${res.data.data.id}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await postApi.uploadFile(file);
      setUploadedFileIds((prev) => [...prev, res.data.data.id]);
      setUploadedFileNames((prev) => [...prev, file.name]);
    } catch {
      setUploadError('파일 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-6">글쓰기</h1>
        <form onSubmit={handleSubmit((data) => createPost(data))} className="space-y-4">
          <div>
            <input
              {...register('title')}
              placeholder="제목"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <textarea
              {...register('content')}
              placeholder="내용을 입력하세요"
              rows={15}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">파일 첨부 (이미지/동영상/문서)</label>
            <input type="file" onChange={handleFileUpload} disabled={isUploading} />
            {isUploading && <p className="text-sm text-blue-600 mt-1">업로드 중...</p>}
            {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
            {uploadedFileNames.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {uploadedFileNames.map((name, i) => (
                  <li key={i} className="text-sm text-green-600">✓ {name}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
              취소
            </button>
            <button type="submit" disabled={isPending || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isPending ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
