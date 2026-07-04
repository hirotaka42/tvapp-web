'use client';

// src/components/rebuild/ContentCard.tsx
// 1 アイテムのカード。サムネプレースホルダ + 題字 + ソースドット + ランク + ハート。

import { useState } from 'react';
import type { Item, SourceId } from '@/lib/sources/types';
import { HeartIcon } from './icons';

const SOURCE_COLOR: Record<SourceId, string> = {
  tver: 'var(--tver)',
  abema: 'var(--abema)',
  youtube: 'var(--yt)',
  niconico: 'var(--nico)',
};

export default function ContentCard({ item }: { item: Item }) {
  const [liked, setLiked] = useState(false);
  const isDrmBlocked = item.playability === 'drm-unplayable';

  return (
    <div className="group relative flex flex-col gap-1.5">
      {/* サムネ枠 */}
      <div className="relative h-24 rounded-lg overflow-hidden bg-app-surf2">
        {/* CSS グラデのプレースホルダ */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 70% 40%, rgba(230,169,78,0.12) 0%, transparent 60%)',
          }}
        />

        {/* ランク */}
        {item.rank != null && (
          <span className="absolute bottom-1 left-2 text-3xl font-extrabold leading-none text-app-tx opacity-80 drop-shadow">
            {item.rank}
          </span>
        )}

        {/* DRM バッジ */}
        {isDrmBlocked && (
          <span className="absolute top-1.5 left-1.5 rounded bg-app-surf/80 px-1.5 py-0.5 text-[10px] font-medium text-app-tx3">
            再生不可
          </span>
        )}

        {/* ハート */}
        <button
          type="button"
          aria-label={liked ? 'お気に入り解除' : 'お気に入り追加'}
          onClick={() => setLiked((v) => !v)}
          className="absolute top-1.5 right-1.5 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <HeartIcon
            className="h-4 w-4"
            style={liked ? { fill: 'var(--acc)', stroke: 'var(--acc)' } : undefined}
          />
        </button>
      </div>

      {/* テキスト部 */}
      <div className="flex items-start gap-1.5 px-0.5">
        {/* ソースドット */}
        <span
          className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: SOURCE_COLOR[item.source] }}
          aria-label={item.source}
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-app-tx">
            {item.title}
          </p>
          {item.subtitle && (
            <p className="mt-0.5 truncate text-xs text-app-tx3">{item.subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
