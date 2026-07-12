'use client';

import { useOffscreenPaused } from '@/hooks/useOffscreenPaused';
import { AbemaChannel, AbemaLiveSlot } from '@/types/abema/view';
import Link from 'next/link';
import { formatJstTime } from '@/utils/abema/homeView/formatJstTime';
import { abemaPlaybackPath } from '@/utils/abema/playbackUrl';

interface AbemaLiveHeroProps {
  slot?: AbemaLiveSlot;
  channel?: AbemaChannel;
  now: number;
}

export function AbemaLiveHero({ slot, channel, now }: AbemaLiveHeroProps) {
  const ref = useOffscreenPaused<HTMLElement>();

  if (!slot) {
    return (
      <article ref={ref} className="ab-live">
        <div className="ab-live-empty">
          <span className="ab-onair"><i aria-hidden="true" />ON AIR</span>
          <h1>現在放送中の番組を取得できません</h1>
          <p>番組表が取得できた場合は、ここに生放送中の番組を表示します。</p>
        </div>
      </article>
    );
  }

  return (
    <article ref={ref} className="ab-live">
      <div className="ab-live-scr">
        <span className="ab-onair"><i aria-hidden="true" />ON AIR</span>
        <span className="ab-ch-tag">{channel?.name || slot.channelId}</span>
        <div className="ab-cmt" aria-hidden="true">
          <span>リアルタイム番組表から表示中</span>
          <span>アプリ内プレイヤーで再生します</span>
          <span>解決できない場合はABEMA公式へ切り替えます</span>
        </div>
        <div className="ab-live-tt">
          <p className="rd">{slot.highlight || 'LIVE PROGRAM'}</p>
          <h1>{slot.title}</h1>
          {slot.content || slot.detailHighlight ? <p>{slot.content || slot.detailHighlight}</p> : null}
        </div>
      </div>
      <div className="ab-live-bar">
        <span className="ab-play-note">アプリ内再生</span>
        <div className="ab-prg">
          <div className="ab-prg-t">
            <span>{formatJstTime(slot.startMs)}</span>
            <span>いま {formatJstTime(now)}</span>
            <span>{formatJstTime(slot.endMs)}</span>
          </div>
          <div className="ab-prg-bar"><i style={{ width: `${slot.progressPercent}%` }} /></div>
        </div>
        <Link className="go" href={abemaPlaybackPath({ kind: 'live', id: slot.channelId })}>再生</Link>
        <span className="sub2" aria-label="アプリ内再生">LIVE</span>
      </div>
    </article>
  );
}
