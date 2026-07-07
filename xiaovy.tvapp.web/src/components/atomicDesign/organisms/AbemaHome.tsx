'use client';

import { AbemaEpg } from '@/components/atomicDesign/molecules/abema/AbemaEpg';
import { AbemaFooter } from '@/components/atomicDesign/molecules/abema/AbemaFooter';
import { AbemaLiveHero } from '@/components/atomicDesign/molecules/abema/AbemaLiveHero';
import { AbemaLiveTicker } from '@/components/atomicDesign/molecules/abema/AbemaLiveTicker';
import { AbemaShelf } from '@/components/atomicDesign/molecules/abema/AbemaShelf';
import { AbemaUpNext } from '@/components/atomicDesign/molecules/abema/AbemaUpNext';
import { useAbemaHome } from '@/hooks/useAbemaHome';
import { AbemaChannel, AbemaSlot } from '@/types/abema/view';
import { deriveEpgGrid } from '@/utils/abema/homeView/deriveEpgGrid';
import { deriveLiveNow } from '@/utils/abema/homeView/deriveLiveNow';
import { deriveShelves } from '@/utils/abema/homeView/deriveShelves';
import { deriveTicker } from '@/utils/abema/homeView/deriveTicker';
import { deriveUpNext } from '@/utils/abema/homeView/deriveUpNext';

interface AbemaHomeProps {
  channels: AbemaChannel[];
  slots: AbemaSlot[];
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

export function AbemaHome({ channels, slots, now = Date.now() }: AbemaHomeProps) {
  const liveSlots = deriveLiveNow(slots, now);
  const upNext = deriveUpNext(slots, now, 5);
  const shelves = deriveShelves(slots, channels, now);
  const grid = deriveEpgGrid(channels, slots, now);
  const heroSlot = liveSlots[0];
  const heroChannel = heroSlot ? channels.find((channel) => channel.id === heroSlot.channelId) : undefined;

  return (
    <section className="world ab-world" id="ab" role="tabpanel" aria-labelledby="dk-abema" aria-label="ABEMA ホーム">
      <AbemaLiveTicker items={deriveTicker(liveSlots, upNext, 8)} />
      <div className="wrap ab-top">
        <AbemaLiveHero slot={heroSlot} channel={heroChannel} now={now} />
        <AbemaUpNext slots={upNext} channels={channels} />
      </div>
      <div className="wrap">
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

  return <AbemaHome channels={channels} slots={slots} />;
}
