'use client';

import Link from 'next/link';

interface ErrorStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  icon,
  actionLabel = 'ホームに戻る',
  actionHref = '/',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        {/* アイコン */}
        {icon && (
          <div className="mb-6 flex justify-center">
            <div className="text-6xl">{icon}</div>
          </div>
        )}

        {/* タイトル */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h1>

        {/* メッセージ */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {message}
        </p>

        {/* アクションボタン */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              再度読み込む
            </button>
          )}
          <Link
            href={actionHref}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-semibold transition"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
