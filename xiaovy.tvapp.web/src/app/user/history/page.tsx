'use client'

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const History = () => {
  const { user } = useFirebaseAuth();
  const router = useRouter();
  const { histories, fetchHistories, loading } = useWatchHistory();
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // ゲストユーザーの場合はリダイレクト
  useEffect(() => {
    if (user && user.isAnonymous) {
      router.push('/user/login');
    }
  }, [user, router]);

  // 初期読み込み
  useEffect(() => {
    if (user && !user.isAnonymous) {
      fetchHistories(limit, offset);
    }
  }, [user, offset, fetchHistories]);

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  if (!user || user.isAnonymous) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          視聴履歴
        </h1>

        {loading && offset === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">読み込み中...</p>
          </div>
        ) : histories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">視聴履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {histories.map((item) => (
              <a
                key={item.id}
                href={`/episode/${item.episodeId}`}
                className="group flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {/* サムネイル */}
                <div className="flex-shrink-0 w-32 h-20 relative rounded-md overflow-hidden">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.episodeTitle}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* コンテンツ情報 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {item.seriesTitle}
                  </p>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:underline">
                    {item.episodeTitle}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(item.watchedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* さらに読み込むボタン */}
        {histories.length >= limit && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
            >
              {loading ? '読み込み中...' : 'さらに読み込む'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;