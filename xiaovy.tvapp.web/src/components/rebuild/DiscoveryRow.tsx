// src/components/rebuild/DiscoveryRow.tsx
// 見出し + カードグリッドの 1 列。

import type { Section } from '@/lib/sources/types';
import ContentCard from './ContentCard';

export default function DiscoveryRow({ section }: { section: Section }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-app-tx">{section.label}</h2>
        <button
          type="button"
          className="text-xs text-app-tx3 transition-colors hover:text-app-acc"
        >
          すべて見る &rarr;
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {section.items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
