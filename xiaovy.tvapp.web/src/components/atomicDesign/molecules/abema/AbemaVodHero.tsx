'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AbemaVodHeroPick, heroShelfLabel } from '@/utils/abema/pickVodHero';
import { resolveAbemaWatchPath } from '@/lib/abema/clientPlayback';

interface AbemaVodHeroProps {
  pick: AbemaVodHeroPick;
}

export function AbemaVodHero({ pick }: AbemaVodHeroProps) {
  const { item, rank, shelfTitle } = pick;
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'resolving' | 'error'>('idle');

  const play = async () => {
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
    <article className="ab-live ab-vhero">
      <button type="button" className="ab-live-scr ab-vhero-scr" onClick={play} aria-label={`${item.title} をアプリ内で再生`}>
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="ab-vhero-bg" src={item.thumbnailUrl} alt="" decoding="async" />
        ) : null}
        <span className="ab-onair ab-vhero-rk">{`${rank}位`}</span>
        <span className="ab-ch-tag">{heroShelfLabel(shelfTitle)}</span>
        <div className="ab-live-tt">
          <p className="rd">VIDEO RANKING · アプリ内再生</p>
          <h1>{item.title}</h1>
          {item.isFree ? <p>いま話題の作品を無料でアプリ内再生できます</p> : null}
        </div>
        {state === 'resolving' ? <span className="ab-vload">再生を準備中…</span> : null}
      </button>
      <div className="ab-live-bar">
        <span className="ab-play-note">{heroShelfLabel(shelfTitle)}ランキング</span>
        <span className="ab-vhero-spacer" />
        <button type="button" className="go" onClick={play}>
          {state === 'error' ? '再試行' : state === 'resolving' ? '準備中…' : '再生'}
        </button>
        <span className="sub2">RANKING</span>
      </div>
    </article>
  );
}
