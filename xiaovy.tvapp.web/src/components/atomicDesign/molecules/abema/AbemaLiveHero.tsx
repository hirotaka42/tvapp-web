import { AbemaChannel, AbemaLiveSlot } from '@/types/abema/view';

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(new Date(ms));
}

interface AbemaLiveHeroProps {
  slot?: AbemaLiveSlot;
  channel?: AbemaChannel;
  now: number;
}

export function AbemaLiveHero({ slot, channel, now }: AbemaLiveHeroProps) {
  if (!slot) {
    return (
      <article className="ab-live">
        <div className="ab-live-empty">
          <span className="ab-onair"><i aria-hidden="true" />ON AIR</span>
          <h1>現在放送中の番組を取得できません</h1>
          <p>番組表が取得できた場合は、ここに生放送中の番組を表示します。</p>
        </div>
      </article>
    );
  }

  return (
    <article className="ab-live">
      <div className="ab-live-scr">
        <span className="ab-onair"><i aria-hidden="true" />ON AIR</span>
        <span className="ab-ch-tag">{channel?.name || slot.channelId}</span>
        <div className="ab-cmt" aria-hidden="true">
          <span>リアルタイム番組表から表示中</span>
          <span>再生はABEMAアプリまたはサイトで行われます</span>
          <span>DRMのため本アプリ内再生には対応していません</span>
        </div>
        <div className="ab-live-tt">
          <p className="rd">{slot.highlight || 'LIVE PROGRAM'}</p>
          <h1>{slot.title}</h1>
          {slot.content || slot.detailHighlight ? <p>{slot.content || slot.detailHighlight}</p> : null}
        </div>
      </div>
      <div className="ab-live-bar">
        <span className="ab-play-note">本アプリ内では再生できません</span>
        <div className="ab-prg">
          <div className="ab-prg-t">
            <span>{formatTime(slot.startMs)}</span>
            <span>いま {formatTime(now)}</span>
            <span>{formatTime(slot.endMs)}</span>
          </div>
          <div className="ab-prg-bar"><i style={{ width: `${slot.progressPercent}%` }} /></div>
        </div>
        <a className="go" href={slot.watchUrl} target="_blank" rel="noopener noreferrer">ABEMA で視聴</a>
        <span className="sub2" aria-label="アプリ内再生不可">DRM再生不可</span>
      </div>
    </article>
  );
}
