'use client';

import Link from 'next/link';
import { useAbemaSeries } from '@/hooks/useAbemaSeries';

interface AbemaWatchSeriesBarProps {
  seriesId: string;
  currentEpisodeId: string;
}

/** Below the player: the current series' episodes (this season) as a horizontal bar, like TVER. */
export function AbemaWatchSeriesBar({ seriesId, currentEpisodeId }: AbemaWatchSeriesBarProps) {
  const { data } = useAbemaSeries(seriesId);
  if (!data) return null;

  const season =
    data.seasons.find((s) => s.episodes.some((ep) => ep.id === currentEpisodeId)) ?? data.seasons[0];
  if (!season || season.episodes.length === 0) return null;

  return (
    <section className="mx-auto w-[95vw] max-w-5xl pb-12 text-left">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-lg font-bold text-white">このシリーズ</h2>
        <span className="text-xs text-gray-400">{data.title}・{season.name}</span>
        <Link
          href={`/service/abema/series/${encodeURIComponent(seriesId)}`}
          className="ml-auto text-xs font-semibold text-emerald-300 hover:text-emerald-200"
        >
          全シーズンを見る →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {season.episodes.map((ep) => {
          const active = ep.id === currentEpisodeId;
          return (
            <Link
              key={ep.id}
              href={`/service/abema/watch/${encodeURIComponent(ep.id)}`}
              aria-current={active ? 'true' : undefined}
              className={`group w-40 flex-none ${active ? 'pointer-events-none' : ''}`}
            >
              <div
                className={`relative aspect-video overflow-hidden rounded-lg bg-[#111827] ring-1 transition ${
                  active ? 'ring-2 ring-emerald-400' : 'ring-white/10 group-hover:ring-emerald-400/60'
                }`}
              >
                {ep.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ep.thumbnailUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                ) : null}
                {active ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-bold text-emerald-300">
                    再生中
                  </span>
                ) : null}
                {ep.isFree ? (
                  <span className="absolute right-1 top-1 rounded bg-emerald-500 px-1.5 text-[10px] font-bold text-emerald-950">無料</span>
                ) : ep.isPremium ? (
                  <span className="absolute right-1 top-1 rounded bg-amber-400 px-1.5 text-[10px] font-bold text-amber-950">有料</span>
                ) : null}
              </div>
              {typeof ep.number === 'number' ? (
                <p className="mt-1 text-[11px] font-bold text-emerald-300">第{ep.number}話</p>
              ) : null}
              <p className={`line-clamp-2 text-xs leading-snug ${active ? 'text-emerald-200' : 'text-gray-200 group-hover:text-emerald-200'}`}>
                {ep.title || `第${ep.number ?? ''}話`}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
