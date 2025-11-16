// src/app/user/history/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { HistoryListItem } from '@/components/atomicDesign/molecules/HistoryListItem';

export default function HistoryPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const { histories, loading, error, fetchHistories, deleteHistory } = useWatchHistory();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/user/login');
      return;
    }

    if (user && !user.isAnonymous) {
      fetchHistories();
    }
  }, [user, authLoading, router, fetchHistories]);

  const handleDelete = async (historyId: string) => {
    try {
      await deleteHistory(historyId);
    } catch (err) {
      console.error('Failed to delete history:', err);
    }
  };

  // ローディング中のスケルトンUI
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            視聴履歴
          </h1>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            視聴履歴
          </h1>
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 空の状態
  if (histories.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            視聴履歴
          </h1>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              視聴履歴がありません
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              エピソードを視聴すると、ここに履歴が表示されます
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 履歴リスト表示
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          視聴履歴
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {histories.map((history) => (
            <HistoryListItem
              key={history.id}
              history={history}
              onDelete={() => handleDelete(history.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
