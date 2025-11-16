// src/app/user/favorite/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteCard } from '@/components/atomicDesign/atoms/FavoriteCard';

export default function FavoritePage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const { favorites, loading, error, fetchFavorites, removeFavorite } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/user/login');
      return;
    }
    if (user && !user.isAnonymous) {
      fetchFavorites();
    }
  }, [user, authLoading, router, fetchFavorites]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">お気に入り</h1>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">お気に入り</h1>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">お気に入り</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">お気に入りがありません</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            シリーズページでハートアイコンをクリックして追加できます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">お気に入り</h1>
      <div className="space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        {favorites.map(favorite => (
          <FavoriteCard
            key={favorite.seriesId}
            favorite={favorite}
            onRemove={() => removeFavorite(favorite.seriesId)}
          />
        ))}
      </div>
    </div>
  );
}
