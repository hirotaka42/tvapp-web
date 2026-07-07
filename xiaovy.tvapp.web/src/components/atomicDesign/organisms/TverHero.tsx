import Image from 'next/image';
import { TverButton } from '@/components/atomicDesign/atoms/TverButton';
import { FeaturedContent } from '@/utils/tver/homeView/types';

export function TverHero({ featured }: { featured: FeaturedContent | null }) {
  if (!featured) return null;

  const provider = featured.productionProviderName || featured.broadcasterName;

  return (
    <div className="wrap tv-hero">
      <div>
        <p className="tv-hero-k">今週の爆推し</p>
        <h1>
          見ないと、<br />
          <em>乗り遅れる。</em>
        </h1>
        <p className="tv-hero-cp">
          「{featured.displayTitle}」が配信中。ランキング上位の注目作を、いまの熱量そのままにチェック。
        </p>
        <ul className="tv-hero-meta">
          {provider && <li>{provider}</li>}
          {featured.broadcastDateLabel && <li>{featured.broadcastDateLabel}</li>}
          <li>ランキング {featured.rank}位</li>
          <li>無料配信中</li>
        </ul>
        <div className="tv-hero-cta">
          <TverButton
            variant="primary"
            href={`/episode/${featured.id}`}
            iconLeft={<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.8v10.4L12 7 3 1.8Z" fill="currentColor" /></svg>}
          >
            いますぐ再生
          </TverButton>
          <TverButton
            variant="ghost"
            href="/user/favorite"
            iconLeft={<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>}
          >
            マイリスト
          </TverButton>
        </div>
        <dl className="tv-word">
          <dt>いま検索されてる</dt>
          <dd>#{featured.displayTitle}<b>▲</b></dd>
          <dd>#ランキング</dd>
        </dl>
      </div>
      <div className="tv-hero-art">
        <Image src={featured.thumbnail.xlarge || featured.thumbnail.small} alt="" fill sizes="(max-width: 920px) 100vw, 50vw" className="object-cover" unoptimized />
        <span className="hnum">EPISODE RANK #{featured.rank}</span>
        <span className="hep">配信中!</span>
        <span className="hat">{featured.displayTitle}</span>
        <span className="hviews">今週の注目作</span>
      </div>
    </div>
  );
}
