// src/components/rebuild/AppShell.tsx
// アプリ外枠。ヘッダー + メイン。

import type { ReactNode } from 'react';
import Link from 'next/link';
import { SearchIcon, HeartIcon, UserIcon } from './icons';

interface AppShellProps {
  headerCenter?: ReactNode;
  children: ReactNode;
}

export default function AppShell({ headerCenter, children }: AppShellProps) {
  return (
    <>
      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-app-line bg-app-bg2 px-4 py-2.5 sm:px-6">
        {/* ブランド */}
        <span className="flex-shrink-0 text-lg font-bold tracking-tight text-app-tx">
          TV<span className="text-app-acc">app</span>
        </span>

        {/* 中央スロット */}
        <div className="flex min-w-0 flex-1 justify-center">{headerCenter}</div>

        {/* 右側 */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* 検索バー風 */}
          <div className="hidden items-center gap-1.5 rounded-full border border-app-line bg-app-surf px-3 py-1.5 text-sm text-app-tx3 sm:flex">
            <SearchIcon className="h-4 w-4" />
            <span>検索</span>
          </div>
          <button type="button" className="sm:hidden" aria-label="検索">
            <SearchIcon className="h-5 w-5 text-app-tx3" />
          </button>
          <Link href="/library" aria-label="お気に入り">
            <HeartIcon className="h-5 w-5 text-app-tx3" />
          </Link>
          <button type="button" aria-label="アカウント">
            <UserIcon className="h-5 w-5 text-app-tx3" />
          </button>
        </div>
      </header>

      {/* ── メイン ── */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
