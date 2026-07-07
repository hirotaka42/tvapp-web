'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AbemaVodItem } from '@/types/abema/view';
import { resolveAbemaWatchPath } from '@/lib/abema/clientPlayback';

interface AbemaVodCardProps {
  item: AbemaVodItem;
  rank?: number;
}

export function AbemaVodCard({ item, rank }: AbemaVodCardProps) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'resolving' | 'error'>('idle');

  const handleClick = async () => {
    if (state === 'resolving') return;
    setState('resolving');
    const path = await resolveAbemaWatchPath(item);
    if (path) {
      router.push(path);
    } else {
      setState('error');
      setTimeout(() => setState('idle'), 2600);
    }
  };

  return (
    <article className="ab-card ab-vcard">
      <button type="button" className="ab-clk ab-vclk" onClick={handleClick} aria-label={`${item.title} をアプリ内で再生`}>
        <div className="ab-th ab-vth">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnailUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <span className="ab-vth-ph" aria-hidden="true" />
          )}
          {rank ? <span className={`ab-rk ab-cnd ${rank === 1 ? 'r1' : ''}`}>{rank}</span> : null}
          {item.isFree ? <span className="ab-vfree">無料</span> : item.isPremium ? <span className="ab-vpaid">有料</span> : null}
          <span className="ab-tht">{item.title}</span>
          {state === 'resolving' ? <span className="ab-vload">読み込み中…</span> : null}
        </div>
        <div className="ab-cm">
          <h3>{item.title}</h3>
          <p className={`au ${state === 'error' ? 'mut' : ''}`}>
            <i aria-hidden="true" />
            {state === 'error' ? '再生できませんでした' : state === 'resolving' ? '再生を準備中…' : 'アプリ内で再生'}
          </p>
        </div>
      </button>
    </article>
  );
}
