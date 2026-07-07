'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AbemaVodHeroPick, heroShelfLabel } from '@/utils/abema/pickVodHero';
import { resolveAbemaWatchPath } from '@/lib/abema/clientPlayback';

interface AbemaVodHeroProps {
  picks: AbemaVodHeroPick[];
}

const ROTATE_MS = 7000;

export function AbemaVodHero({ picks }: AbemaVodHeroProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<'idle' | 'resolving' | 'error'>('idle');
  const pausedRef = useRef(false);

  useEffect(() => {
    if (picks.length <= 1) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) setIndex((current) => (current + 1) % picks.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [picks.length]);

  if (picks.length === 0) return null;
  const pick = picks[index % picks.length] ?? picks[0];
  const { item, rank, shelfTitle } = pick;

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
    <article
      className="ab-live ab-vhero"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <button
        key={item.contentId}
        type="button"
        className="ab-live-scr ab-vhero-scr"
        onClick={play}
        aria-label={`${item.title} をアプリ内で再生`}
      >
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

      {picks.length > 1 ? (
        <div className="ab-vhero-dots" role="tablist" aria-label="ランキングスライド">
          {picks.map((p, i) => (
            <button
              key={p.item.contentId}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1}番目のランキング作品`}
              className={i === index ? 'on' : ''}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}

      <div className="ab-live-bar">
        <span className="ab-play-note">{heroShelfLabel(shelfTitle)}</span>
        <span className="ab-vhero-spacer" />
        <button type="button" className="go" onClick={play}>
          {state === 'error' ? '再試行' : state === 'resolving' ? '準備中…' : '再生'}
        </button>
        <span className="sub2">RANKING</span>
      </div>
    </article>
  );
}
