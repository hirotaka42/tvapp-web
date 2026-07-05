'use client';

// src/app/watch/[source]/[id]/WatchContent.tsx
// 視聴画面のクライアント部分。動画再生・お気に入り・履歴記録。

import { useCallback } from 'react';
import Link from 'next/link';
import type { Item, SourceId } from '@/lib/sources/types';
import Player from '@/components/rebuild/Player';
import FavoriteButton from '@/components/rebuild/FavoriteButton';
import { recordHistory } from '@/lib/userdata/local';

const SOURCE_COLOR: Record<SourceId, string> = {
  tver: 'var(--tver)',
  abema: 'var(--abema)',
  youtube: 'var(--yt)',
  niconico: 'var(--nico)',
};

interface WatchContentProps {
  item: Item;
}

export default function WatchContent({ item }: WatchContentProps) {
  const handleStarted = useCallback(() => {
    recordHistory(item);
  }, [item]);

  const playabilityNote =
    item.playability === 'drm-unplayable'
      ? 'DRM protected -- metadata only'
      : item.playability === 'account-required'
        ? 'Account required for playback'
        : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-app-tx3 transition-colors hover:text-app-acc"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back
      </Link>

      {/* Video area */}
      {item.stream?.kind === 'youtube' ? (
        <Player videoId={item.stream.videoId} onStarted={handleStarted} />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-app-surf2">
          <p className="px-4 text-center text-sm text-app-tx3">
            Demo item -- playback available after source adapter connection
          </p>
        </div>
      )}

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-lg font-bold leading-snug text-app-tx sm:text-xl">
              {item.title}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SOURCE_COLOR[item.source] }}
              />
              {item.subtitle && (
                <span className="text-sm text-app-tx3">{item.subtitle}</span>
              )}
            </div>
          </div>
          <FavoriteButton item={item} className="flex-shrink-0 pt-1" />
        </div>

        {playabilityNote && (
          <p className="rounded border border-app-line bg-app-surf px-3 py-2 text-xs text-app-tx3">
            {playabilityNote}
          </p>
        )}
      </div>
    </div>
  );
}
