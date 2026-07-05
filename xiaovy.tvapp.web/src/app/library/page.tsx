'use client';

// src/app/library/page.tsx
// お気に入り・視聴履歴の一覧画面。

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SourceId } from '@/lib/sources/types';
import { listFavorites, listHistory } from '@/lib/userdata/local';
import AppShell from '@/components/rebuild/AppShell';
import { HeartIcon, ClockIcon } from '@/components/rebuild/icons';

const SOURCE_COLOR: Record<SourceId, string> = {
  tver: 'var(--tver)',
  abema: 'var(--abema)',
  youtube: 'var(--yt)',
  niconico: 'var(--nico)',
};

interface StoredItem {
  source: SourceId;
  id: string;
  title: string;
  subtitle?: string;
}

function ItemRow({ items, emptyText }: { items: StoredItem[]; emptyText: string }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-app-tx3">{emptyText}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Link
          key={`${it.source}-${it.id}`}
          href={`/watch/${it.source}/${it.id}`}
          className="flex items-center gap-3 rounded-lg border border-app-line bg-app-surf px-3 py-2.5 transition-colors hover:bg-app-surf2 focus-visible:ring-2 focus-visible:ring-app-acc"
        >
          <span
            className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: SOURCE_COLOR[it.source] }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-app-tx">{it.title}</p>
            {it.subtitle && (
              <p className="truncate text-xs text-app-tx3">{it.subtitle}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<StoredItem[]>([]);
  const [history, setHistory] = useState<StoredItem[]>([]);

  useEffect(() => {
    setFavorites(listFavorites() as StoredItem[]);
    setHistory(listHistory() as StoredItem[]);
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Favorites */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-app-acc" />
            <h2 className="text-base font-semibold text-app-tx">Favorites</h2>
          </div>
          <ItemRow items={favorites} emptyText="No favorites yet" />
        </section>

        {/* History */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-app-tx3" />
            <h2 className="text-base font-semibold text-app-tx">Watch History</h2>
          </div>
          <ItemRow items={history} emptyText="No history yet" />
        </section>
      </div>
    </AppShell>
  );
}
