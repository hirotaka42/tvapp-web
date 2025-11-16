// src/components/atomicDesign/atoms/FavoriteButton.tsx

'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  seriesId: string;
  seriesTitle: string;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
  disabled?: boolean;
}

export function FavoriteButton({
  seriesId,
  seriesTitle,
  isFavorite,
  onToggle,
  disabled = false
}: FavoriteButtonProps) {
  const { addFavorite, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // リンクのクリックを防ぐ
    e.stopPropagation(); // 親要素へのイベント伝播を防ぐ

    if (disabled) {
      toast.error('ログインしてお気に入りを使用できます');
      return;
    }

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
      disabled={loading || disabled}
      className={`p-2 rounded-full transition ${
        disabled
          ? 'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'
      }`}
      aria-label={disabled ? 'ログインしてください' : (isFavorite ? 'お気に入りから削除' : 'お気に入りに追加')}
      title={disabled ? 'ログインしてお気に入りを使用できます' : ''}
    >
      {isFavorite ? (
        <HeartIconSolid className={`w-6 h-6 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-red-500'}`} />
      ) : (
        <HeartIconOutline className={`w-6 h-6 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`} />
      )}
    </button>
  );
}
