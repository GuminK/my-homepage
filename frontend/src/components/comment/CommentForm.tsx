import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  initialValue = '',
  placeholder = '댓글을 입력하세요',
  submitLabel = '등록',
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
        rows={3}
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
