'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';

export type AdminNoticeType = 'success' | 'warning' | 'error' | 'info';

export interface AdminNoticeMessage {
  type: AdminNoticeType;
  message: string;
}

interface AdminNoticeProps extends AdminNoticeMessage {
  onDismiss?: () => void;
}

const styles: Record<AdminNoticeType, string> = {
  success: 'border-green-600 bg-green-50 text-green-900',
  warning: 'border-amber-500 bg-amber-50 text-amber-950',
  error: 'border-red-600 bg-red-50 text-red-900',
  info: 'border-blue-600 bg-blue-50 text-blue-900',
};

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

export default function AdminNotice({
  type,
  message,
  onDismiss,
}: AdminNoticeProps) {
  const Icon = icons[type];

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 border-l-4 px-4 py-3 text-sm ${styles[type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-6">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          title="알림 닫기"
          className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-current/70 transition-colors hover:bg-black/5 hover:text-current"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">알림 닫기</span>
        </button>
      ) : null}
    </div>
  );
}
