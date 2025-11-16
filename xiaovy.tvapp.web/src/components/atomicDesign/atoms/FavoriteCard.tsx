// src/components/atomicDesign/atoms/FavoriteCard.tsx

'use client';

import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import { FavoriteResponse } from '@/types/Favorite';

interface FavoriteCardProps {
  favorite: FavoriteResponse;
  onRemove: () => void;
}

export function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
      <Link href={`/series/${favorite.seriesId}`} className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
          {favorite.seriesTitle}
        </h3>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        className="ml-2 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        aria-label="お気に入りから削除"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
