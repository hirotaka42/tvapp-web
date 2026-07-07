import { AbemaChannel, AbemaLiveSlot, AbemaShelf as AbemaShelfType } from '@/types/abema/view';
import { AbemaCard } from './AbemaCard';

interface AbemaShelfProps {
  shelf: AbemaShelfType;
  channels: AbemaChannel[];
  liveSlots: AbemaLiveSlot[];
}

export function AbemaShelf({ shelf, channels, liveSlots }: AbemaShelfProps) {
  const channelFor = (channelId: string) => channels.find((channel) => channel.id === channelId);
  const liveIds = new Set(liveSlots.map((slot) => slot.id));

  return (
    <section className="ab-sec" aria-label={shelf.title}>
      <div className="ab-sech">
        <h2>{shelf.title}</h2><span className="cnt ab-cnd">{shelf.note}</span>
        <a className="ab-more" href="https://abema.tv/timetable" target="_blank" rel="noopener noreferrer">番組表へ</a>
      </div>
      <div className="ab-row">
        {shelf.items.map((slot, index) => (
          <AbemaCard
            key={slot.id}
            slot={slot}
            channel={channelFor(slot.channelId)}
            rank={index + 1}
            isLive={liveIds.has(slot.id)}
          />
        ))}
      </div>
    </section>
  );
}
