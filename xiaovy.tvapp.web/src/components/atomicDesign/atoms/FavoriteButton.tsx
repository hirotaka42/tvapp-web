// src/components/atomicDesign/atoms/FavoriteButton.tsx

'use client';

import { useState } from 'react';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  seriesId: string;
  seriesTitle: string;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  seriesId,
  seriesTitle,
  isFavorite,
  onToggle
}: FavoriteButtonProps) {
  const { addFavorite, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // リンクのクリックを防ぐ
    e.stopPropagation(); // 親要素へのイベント伝播を防ぐ

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(seriesId);
        onToggle(false);
      } else {
        await addFavorite({ seriesId, seriesTitle });
        onToggle(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      {isFavorite ? (
        <HeartIconSolid className="w-6 h-6 text-red-500" />
      ) : (
        <HeartIconOutline className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      )}
    </button>
  );
}
