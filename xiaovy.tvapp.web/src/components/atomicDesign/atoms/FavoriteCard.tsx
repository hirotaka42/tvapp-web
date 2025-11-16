// src/components/atomicDesign/atoms/FavoriteCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import { FavoriteResponse } from '@/types/Favorite';
import { formatDate } from '@/utils/dateFormatter';

interface FavoriteCardProps {
  favorite: FavoriteResponse;
  onRemove: () => void;
}

export function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  return (
    <div className="relative group">
      <Link href={`/series/${favorite.seriesId}`}>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image
            src={favorite.thumbnailUrl}
            alt={favorite.seriesTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
          {favorite.seriesTitle}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(favorite.addedAt)}
        </p>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        aria-label="お気に入りから削除"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
