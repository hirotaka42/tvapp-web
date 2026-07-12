'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useOffscreenPaused } from '@/hooks/useOffscreenPaused';
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { deriveExpiryLabel } from '@/utils/tver/homeView/deriveExpiryLabel';

export function EndingSoonBand({ items }: { items: ConvertedContent[] }) {
  const rootRef = useOffscreenPaused<HTMLElement>();

  if (!items.length) return null;

  return (
    <section ref={rootRef} className="tv-last wrap" aria-label="本日終了">
      <div className="tv-last-in">
        <div className="tv-last-h">
          <h2>本日終了</h2>
          <span className="bl">LAST CHANCE</span>
        </div>
        <div className="tv-lrow">
          {items.map((item) => (
            <Link className="tv-lite" href={`/episode/${item.id}`} key={item.id}>
              <span className="tv-lth">
                <Image src={item.thumbnail.small} alt="" fill sizes="92px" className="object-cover" unoptimized />
              </span>
              <span className="tv-lmt">
                <h3>{item.seriesTitle || item.title}</h3>
                <p>{item.productionProviderName || item.broadcasterName}</p>
                <b>{deriveExpiryLabel(item.endAt)}</b>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
