'use client';

import { useEffect, useState } from 'react';
import { AbemaEpg } from '@/components/atomicDesign/molecules/abema/AbemaEpg';
import { AbemaFooter } from '@/components/atomicDesign/molecules/abema/AbemaFooter';
import { AbemaLiveHero } from '@/components/atomicDesign/molecules/abema/AbemaLiveHero';
import { AbemaVodHero } from '@/components/atomicDesign/molecules/abema/AbemaVodHero';
import { AbemaLiveTicker } from '@/components/atomicDesign/molecules/abema/AbemaLiveTicker';
import { AbemaShelf } from '@/components/atomicDesign/molecules/abema/AbemaShelf';
import { AbemaLiveNowPanel } from '@/components/atomicDesign/molecules/abema/AbemaLiveNowPanel';
import { AbemaVodRanking } from '@/components/atomicDesign/organisms/AbemaVodRanking';
import { useAbemaHome } from '@/hooks/useAbemaHome';
import { AbemaVodState, useAbemaVod } from '@/hooks/useAbemaVod';
import { AbemaChannel, AbemaSlot } from '@/types/abema/view';
import { deriveEpgGrid } from '@/utils/abema/homeView/deriveEpgGrid';
import { deriveLiveNow } from '@/utils/abema/homeView/deriveLiveNow';
import { deriveShelves } from '@/utils/abema/homeView/deriveShelves';
import { deriveTicker } from '@/utils/abema/homeView/deriveTicker';
import { deriveUpNext } from '@/utils/abema/homeView/deriveUpNext';
import { AbemaVodHeroPick, orderVodHeroCarousel } from '@/utils/abema/pickVodHero';

interface AbemaHomeProps {
  channels: AbemaChannel[];
  slots: AbemaSlot[];
  vod: AbemaVodState;
  now?: number;
}

function formatNow(ms: number): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(new Date(ms));
}

export function AbemaHome({ channels, slots, vod, now = Date.now() }: AbemaHomeProps) {
  const liveSlots = deriveLiveNow(slots, now);
  const upNext = deriveUpNext(slots, now, 5);
  const shelves = deriveShelves(slots, channels, now);
  const grid = deriveEpgGrid(channels, slots, now);
  const heroSlot = liveSlots[0];
  const heroChannel = heroSlot ? channels.find((channel) => channel.id === heroSlot.channelId) : undefined;

  // Hero: an auto-rotating carousel of the top ranking items (once shelves arrive),
  // instead of the fixed live channel. Falls back to the live hero when VOD is empty.
  const [heroPicks, setHeroPicks] = useState<AbemaVodHeroPick[]>([]);
  useEffect(() => {
    if (heroPicks.length === 0 && vod.shelves.length > 0) {
      setHeroPicks(orderVodHeroCarousel(vod.shelves));
    }
  }, [vod.shelves, heroPicks.length]);

  return (
    <section className="world ab-world" id="ab" role="tabpanel" aria-labelledby="dk-abema" aria-label="ABEMA ホーム">
      <AbemaLiveTicker items={deriveTicker(liveSlots, upNext, 8)} />
      <div className="wrap ab-top">
        {heroPicks.length > 0 ? (
          <AbemaVodHero picks={heroPicks} />
        ) : (
          <AbemaLiveHero slot={heroSlot} channel={heroChannel} now={now} />
        )}
        <AbemaLiveNowPanel liveSlots={liveSlots} channels={channels} />
      </div>
      <div className="wrap">
        <AbemaVodRanking vod={vod} />
        <AbemaEpg grid={grid} liveCount={liveSlots.length} nowLabel={formatNow(now)} />
        {shelves.map((shelf) => (
          <AbemaShelf key={shelf.key} shelf={shelf} channels={channels} liveSlots={liveSlots} />
        ))}
      </div>
      <AbemaFooter />
    </section>
  );
}

export function AbemaHomeContainer() {
  const { channels, slots, loading, error, reload } = useAbemaHome();
  const vod = useAbemaVod();

  if (loading) {
    return (
      <section className="world ab-world ab-state" id="ab" role="tabpanel" aria-labelledby="dk-abema" aria-label="ABEMA ホーム">
        <div className="ab-state-box">ABEMAの番組表を読み込み中...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="world ab-world ab-state" id="ab" role="tabpanel" aria-labelledby="dk-abema" aria-label="ABEMA ホーム">
        <div className="ab-state-box">
          <h1>ABEMAの番組表を取得できません</h1>
          <p>一時的な通信エラーの可能性があります。再生はABEMA公式サイトで行ってください。</p>
          <button type="button" onClick={reload}>再読み込み</button>
        </div>
      </section>
    );
  }

  return <AbemaHome channels={channels} slots={slots} vod={vod} />;
}
