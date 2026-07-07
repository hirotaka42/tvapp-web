import { AbemaChannel, AbemaSlot } from '@/types/abema/view';
import Link from 'next/link';
import { abemaSlotPlaybackPath } from '@/utils/abema/playbackUrl';

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(new Date(ms));
}

interface AbemaCardProps {
  slot: AbemaSlot;
  channel?: AbemaChannel;
  rank?: number;
  isLive?: boolean;
}

export function AbemaCard({ slot, channel, rank, isLive = false }: AbemaCardProps) {
  return (
    <article className="ab-card">
      <Link className="ab-clk" href={abemaSlotPlaybackPath(slot)}>
        <div className={`ab-th ${slot.thumbKey}`} aria-hidden="true">
          {rank ? <span className={`ab-rk ab-cnd ${rank === 1 ? 'r1' : ''}`}>{rank}</span> : null}
          {isLive ? <span className="ab-lv"><i />LIVE</span> : <span className="ab-dur">{formatTime(slot.startMs)}</span>}
          <span className="ab-tht">{slot.title}</span>
        </div>
        <div className="ab-cm">
          <h3>{slot.title}</h3>
          <p className="st">{channel?.name || slot.channelId}・{formatTime(slot.startMs)}</p>
          <p className={`au ${isLive ? '' : 'mut'}`}>
            <i aria-hidden="true" />
            {isLive ? 'いま放送中' : 'ABEMAで開く'}
          </p>
        </div>
      </Link>
    </article>
  );
}
