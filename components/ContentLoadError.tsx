'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ContentLoadErrorProps {
  message?: string;
  onRetry: () => void;
  compact?: boolean;
}

export default function ContentLoadError({
  message = '콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  onRetry,
  compact = false,
}: ContentLoadErrorProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-red-200 bg-red-50 text-center ${compact ? 'p-6' : 'px-5 py-14'}`}
    >
      <AlertCircle className="mx-auto h-8 w-8 text-red-600" aria-hidden="true" />
      <p className="mx-auto mt-3 max-w-xl leading-7 text-red-900">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-4 font-bold text-white transition-colors hover:bg-red-800"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        다시 시도
      </button>
    </div>
  );
}
