'use client';

// src/components/rebuild/FavoriteButton.tsx
// ハートボタン。クリックで toggleFavorite、状態を反映。

import { useState, useEffect, useCallback } from 'react';
import type { Item } from '@/lib/sources/types';
import { toggleFavorite, isFavorite } from '@/lib/userdata/local';
import { HeartIcon } from './icons';

interface FavoriteButtonProps {
  item: Item;
  className?: string;
}

export default function FavoriteButton({ item, className }: FavoriteButtonProps) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isFavorite(item.source, item.id));
  }, [item.source, item.id]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      toggleFavorite(item);
      setLiked((v) => !v);
    },
    [item],
  );

  return (
    <button
      type="button"
      aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
      onClick={handleClick}
      className={className}
    >
      <HeartIcon
        className="h-5 w-5"
        style={liked ? { fill: 'var(--acc)', stroke: 'var(--acc)' } : undefined}
      />
    </button>
  );
}
