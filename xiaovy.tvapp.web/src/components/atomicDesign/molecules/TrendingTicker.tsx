'use client';

import { useOffscreenPaused } from '@/hooks/useOffscreenPaused';
import { TickerItem } from '@/utils/tver/homeView/types';

export function TrendingTicker({ items }: { items: TickerItem[] }) {
  const rootRef = useOffscreenPaused<HTMLDivElement>();

  if (!items.length) return null;

  const sequence = (
    <div className="tv-tick-seq">
      {items.map((item) => (
        <span key={item.id}>
          <b className={item.variant === 'ending' ? 'pk' : undefined}>{item.label}</b>
          {item.text}
        </span>
      ))}
    </div>
  );

  return (
    <div ref={rootRef} className="tv-tick" aria-hidden="true">
      <div className="tv-tick-in">
        {sequence}
        {sequence}
      </div>
    </div>
  );
}
