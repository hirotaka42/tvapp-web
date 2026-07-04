'use client';

// src/components/rebuild/DiscoveryHome.tsx
// 発見ホーム。横断おすすめ + ソース別セクション。

import { useState } from 'react';
import type { SourceId, Section, Item } from '@/lib/sources/types';
import AppShell from './AppShell';
import SourceSwitcher from './SourceSwitcher';
import DiscoveryRow from './DiscoveryRow';
interface DiscoveryHomeProps {
  data: Record<SourceId, Section[]>;
  sources: { id: SourceId; label: string }[];
  crossPicks: Item[];
}

export default function DiscoveryHome({ data, sources, crossPicks }: DiscoveryHomeProps) {
  const [active, setActive] = useState<SourceId>(sources[0].id);

  const activeSections = data[active] ?? [];

  return (
    <AppShell
      headerCenter={
        <SourceSwitcher sources={sources} active={active} onChange={setActive} />
      }
    >
      <div className="space-y-8">
        {/* ヒーロー(crossPicks 先頭 1 件) */}
        {crossPicks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-app-tx">
              今日のおすすめ
            </h2>
            <div className="relative h-40 overflow-hidden rounded-xl bg-app-surf2 sm:h-52">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 60% 30%, rgba(230,169,78,0.18) 0%, transparent 60%)',
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <p className="text-lg font-bold leading-tight text-app-tx sm:text-xl">
                  {crossPicks[0].title}
                </p>
                {crossPicks[0].subtitle && (
                  <p className="text-sm text-app-tx3">{crossPicks[0].subtitle}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 横断おすすめ */}
        {crossPicks.length > 1 && (
          <DiscoveryRow
            section={{
              key: 'cross-recommended',
              label: '今日の横断おすすめ',
              items: crossPicks.slice(1),
            }}
          />
        )}

        {/* ソース別セクション */}
        {activeSections.map((section) => (
          <DiscoveryRow key={section.key} section={section} />
        ))}
      </div>
    </AppShell>
  );
}
