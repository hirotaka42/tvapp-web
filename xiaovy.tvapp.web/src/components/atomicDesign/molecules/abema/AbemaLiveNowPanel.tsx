import Link from 'next/link';
import { AbemaChannel, AbemaLiveSlot } from '@/types/abema/view';
import { abemaPlaybackPath } from '@/utils/abema/playbackUrl';

interface AbemaLiveNowPanelProps {
  liveSlots: AbemaLiveSlot[];
  channels: AbemaChannel[];
}

/** Right-hand top panel: what is airing live right now (realtime), each plays in-app. */
export function AbemaLiveNowPanel({ liveSlots, channels }: AbemaLiveNowPanelProps) {
  const channelName = (channelId: string) => channels.find((channel) => channel.id === channelId)?.name || channelId;
  const items = liveSlots.slice(0, 6);

  return (
    <aside className="ab-next" aria-label="いま放送中">
      <div className="ab-next-h">
        <span className="lv">LIVE NOW</span>
        <h2>いま放送中</h2>
        <a href="#ab-epg">番組表へ</a>
      </div>
      <ol>
        {items.length ? (
          items.map((slot) => (
            <li key={slot.id}>
              <Link className="rw ab-now-rw" href={abemaPlaybackPath({ kind: 'live', id: slot.channelId })}>
                <span className="ab-now-lv"><i aria-hidden="true" />LIVE</span>
                <span className="nm">
                  <b>{slot.title}</b>
                  <span>{channelName(slot.channelId)}</span>
                </span>
                <span className="rsv">再生</span>
              </Link>
            </li>
          ))
        ) : (
          <li>
            <span className="ab-empty-row">いま放送中の番組を取得できません</span>
          </li>
        )}
      </ol>
    </aside>
  );
}
