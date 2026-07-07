import { AbemaChannel, AbemaSlot } from '@/types/abema/view';

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(new Date(ms));
}

interface AbemaUpNextProps {
  slots: AbemaSlot[];
  channels: AbemaChannel[];
}

export function AbemaUpNext({ slots, channels }: AbemaUpNextProps) {
  const channelName = (channelId: string) => channels.find((channel) => channel.id === channelId)?.name || channelId;

  return (
    <aside className="ab-next" aria-label="このあとの注目">
      <div className="ab-next-h"><span className="lv">UP NEXT</span><h2>このあとの注目</h2><a href="#ab-epg">番組表へ</a></div>
      <ol>
        {slots.length ? slots.map((slot) => (
          <li key={slot.id}>
            <a className="rw" href={slot.watchUrl} target="_blank" rel="noopener noreferrer">
              <span className="tm">{formatTime(slot.startMs)}<em>{channelName(slot.channelId)}</em></span>
              <span className="nm"><b>{slot.title}</b><span>{slot.highlight || slot.detailHighlight || 'ABEMAで開く'}</span></span>
              <span className="rsv">開く</span>
            </a>
          </li>
        )) : (
          <li><span className="ab-empty-row">このあとの番組を取得できません</span></li>
        )}
      </ol>
    </aside>
  );
}
