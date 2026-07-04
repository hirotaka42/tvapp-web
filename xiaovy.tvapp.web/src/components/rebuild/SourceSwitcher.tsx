'use client';

// src/components/rebuild/SourceSwitcher.tsx
// ソース切替のセグメント(pill)。横スクロール可。

import type { SourceId } from '@/lib/sources/types';

interface SourceSwitcherProps {
  sources: { id: SourceId; label: string }[];
  active: SourceId;
  onChange: (id: SourceId) => void;
}

export default function SourceSwitcher({ sources, active, onChange }: SourceSwitcherProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-none"
      aria-label="ソース切替"
    >
      {sources.map((s) => {
        const isActive = s.id === active;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-app-acc text-app-bg'
                : 'text-app-tx3 hover:text-app-tx'
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
