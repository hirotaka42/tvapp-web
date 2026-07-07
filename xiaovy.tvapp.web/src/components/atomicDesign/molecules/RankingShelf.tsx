import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { RankingShelfCard } from '@/components/atomicDesign/molecules/RankingShelfCard';
import { SectionAccent } from '@/utils/tver/homeView/types';

interface RankingShelfProps {
  label: string;
  contents: ConvertedContent[];
  accent: SectionAccent;
  updatedLabel?: string;
}

export function RankingShelf({ label, contents, accent, updatedLabel = '10分ごと更新' }: RankingShelfProps) {
  return (
    <section className={`tv-sec ${accent}`} aria-label={`${label}ランキング`}>
      <div className="tv-sech">
        <h2>{label}</h2>
        <span className="tag">TOP {Math.min(contents.length, 10)}</span>
        <span className="upd">{updatedLabel}</span>
        <a className="tv-more" href="#">
          もっと見る
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <div className="tv-row">
        {contents.map((content) => (
          <RankingShelfCard
            key={content.id}
            id={content.id}
            seriesTitle={content.seriesTitle}
            title={content.title}
            thumbnail={content.thumbnail.small}
            rank={content.rank}
            genre={label}
            broadcasterName={content.broadcasterName}
            productionProviderName={content.productionProviderName}
            broadcastDateLabel={content.broadcastDateLabel}
            endAt={content.endAt}
          />
        ))}
      </div>
    </section>
  );
}
