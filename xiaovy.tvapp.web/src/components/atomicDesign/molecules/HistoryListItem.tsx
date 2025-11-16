// src/components/atomicDesign/molecules/HistoryListItem.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import { WatchHistoryResponse } from '@/types/WatchHistory';
import { formatRelativeTime } from '@/utils/dateFormatter';

interface HistoryListItemProps {
  history: WatchHistoryResponse;
  onDelete: () => void;
}

export function HistoryListItem({ history, onDelete }: HistoryListItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowConfirm(false);
  };

  return (
    <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
      <Link href={`/episode/${history.episodeId}`} className="flex-shrink-0">
        <div className="relative w-40 h-24 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image
            src={history.thumbnailUrl}
            alt={history.episodeTitle}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/episode/${history.episodeId}`}>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
            {history.episodeTitle}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {history.seriesTitle}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
            {history.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {formatRelativeTime(history.watchedAt)}
          </p>
        </Link>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={() => setShowConfirm(true)}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition"
          aria-label="削除"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 削除確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              この履歴を削除しますか？
            </h3>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
