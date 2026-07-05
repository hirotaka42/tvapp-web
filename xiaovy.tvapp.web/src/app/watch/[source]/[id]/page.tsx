// src/app/watch/[source]/[id]/page.tsx
// 視聴画面(Server Component)。params から Item を引き、Player + 情報を表示。

import type { SourceId } from '@/lib/sources/types';
import { getItemByRef } from '@/lib/sources/lookup';
import AppShell from '@/components/rebuild/AppShell';
import WatchContent from './WatchContent';

interface WatchPageProps {
  params: { source: string; id: string };
}

const VALID_SOURCES = new Set<string>(['tver', 'abema', 'youtube', 'niconico']);

export default async function WatchPage({ params }: WatchPageProps) {
  const { source, id } = params;

  if (!VALID_SOURCES.has(source)) {
    return (
      <AppShell>
        <NotFound />
      </AppShell>
    );
  }

  const item = await getItemByRef(source as SourceId, id);

  if (!item) {
    return (
      <AppShell>
        <NotFound />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <WatchContent item={item} />
    </AppShell>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-lg font-semibold text-app-tx">
        Content not found
      </p>
      <a
        href="/"
        className="text-sm text-app-acc transition-colors hover:text-app-acc2"
      >
        Home
      </a>
    </div>
  );
}
