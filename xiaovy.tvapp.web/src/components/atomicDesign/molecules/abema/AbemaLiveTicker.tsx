'use client';

import { useOffscreenPaused } from '@/hooks/useOffscreenPaused';
import { AbemaTickerItem } from '@/types/abema/view';

interface AbemaLiveTickerProps {
  items: AbemaTickerItem[];
}

export function AbemaLiveTicker({ items }: AbemaLiveTickerProps) {
  const ref = useOffscreenPaused<HTMLDivElement>();

  if (!items.length) return null;
  const sequence = (
    <div className="ab-tick-seq">
      {items.map((item) => (
        <span key={item.id}>
          <b className={item.badgeVariant === 'reserve' ? 'rs' : undefined}>{item.badge}</b>
          {item.text}
        </span>
      ))}
    </div>
  );

  return (
    <div ref={ref} className="ab-tick" aria-hidden="true">
      <div className="ab-tick-in">
        {sequence}
        {sequence}
      </div>
    </div>
  );
}
