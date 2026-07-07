import Link from 'next/link';
import { CardThumbnail } from '@/components/atomicDesign/atoms/CardThumbnail';
import { ExpiryLabel } from '@/components/atomicDesign/atoms/ExpiryLabel';
import { GenreTag } from '@/components/atomicDesign/atoms/GenreTag';
import { HotBadge } from '@/components/atomicDesign/atoms/HotBadge';
import { RankBadge } from '@/components/atomicDesign/atoms/RankBadge';
import { deriveExpiryLabel } from '@/utils/tver/homeView/deriveExpiryLabel';

interface RankingShelfCardProps {
  id: string;
  seriesTitle: string;
  title: string;
  thumbnail: string;
  rank?: number;
  genre?: string;
  broadcasterName?: string;
  productionProviderName?: string;
  broadcastDateLabel?: string;
  endAt?: number;
}

function episodeLabel(title: string, seriesTitle: string): string | undefined {
  const normalized = title.replace(seriesTitle, '').trim();
  const match = normalized.match(/(第\d+話|最終回|SP)/);
  return match?.[0];
}

export function RankingShelfCard({
  id,
  seriesTitle,
  title,
  thumbnail,
  rank,
  genre,
  broadcasterName,
  productionProviderName,
  broadcastDateLabel,
  endAt,
}: RankingShelfCardProps) {
  const provider = productionProviderName || broadcasterName;
  const meta = [provider, broadcastDateLabel].filter(Boolean).join('・');
  const expiry = deriveExpiryLabel(endAt);

  return (
    <article className="tv-card">
      <Link className="tv-clk" href={`/episode/${id}`}>
        {expiry?.startsWith('本日') && <HotBadge kind="last" label="今夜まで" />}
        {rank !== undefined && rank !== 0 && <RankBadge rank={rank} />}
        <CardThumbnail
          src={thumbnail}
          title={title}
          seriesTitle={seriesTitle || title}
          episodeLabel={episodeLabel(title, seriesTitle)}
        />
        <div className="tv-cm">
          <h3>{seriesTitle || title}</h3>
          {meta && <p className="tv-st">{meta}</p>}
          <div className="tv-mrow">
            {genre && <GenreTag label={genre} />}
            {endAt && <ExpiryLabel endAt={endAt} />}
          </div>
        </div>
      </Link>
    </article>
  );
}
