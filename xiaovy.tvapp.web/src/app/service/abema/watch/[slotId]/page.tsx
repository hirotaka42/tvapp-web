"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { AbemaWatchSeriesBar } from '@/components/atomicDesign/molecules/abema/AbemaWatchSeriesBar';
import { useAbemaStream } from '@/hooks/useAbemaStream';
import { useAbemaProgram } from '@/hooks/useAbemaProgram';
import { externalAbemaWatchUrl } from '@/utils/abema/playbackUrl';
import { abemaStreamErrorMessage } from '@/utils/abema/streamErrorMessage';

function AbemaWatchPage(props: { params: Promise<{ slotId: string }> }) {
  const { slotId } = use(props.params);
  const { data, error, errorReason, retry } = useAbemaStream({ type: 'slot', slotId });
  const { data: program } = useAbemaProgram(slotId);
  const officialUrl = externalAbemaWatchUrl({ kind: 'watch', id: slotId });
  const isPremium = program?.isPremium === true;

  const heading = program?.episodeTitle || program?.seriesTitle || 'ABEMA Program';
  const subParts = [
    program?.seriesTitle,
    program?.seasonName,
    program?.episodeNumber ? `第${program.episodeNumber}話` : undefined,
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative mx-auto aspect-video w-full max-w-[min(100%,calc((100dvh-8rem)*16/9))]">
        {isPremium ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">有料</span>
            <p className="text-lg font-semibold">この作品は有料(プレミアム)です</p>
            <p className="max-w-xl text-sm text-gray-300">有料のため、アプリ内では再生できません。ABEMA公式でご視聴ください。</p>
            <a className="rounded-lg border border-white/30 px-5 py-2 font-semibold text-white transition hover:bg-white/10" href={officialUrl} target="_blank" rel="noopener noreferrer">
              ABEMAで視聴
            </a>
          </div>
        ) : data ? (
          <VideoPlayer url={data.video_url} proxy="none" />
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">ABEMAを再生できませんでした</p>
            <p className="max-w-xl text-sm text-gray-300">{abemaStreamErrorMessage(errorReason, error.message)}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {errorReason !== 'premium' ? (
                <button
                  onClick={retry}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  再試行
                </button>
              ) : null}
              <a className="rounded-lg border border-white/30 px-5 py-2 font-semibold text-white transition hover:bg-white/10" href={officialUrl} target="_blank" rel="noopener noreferrer">
                ABEMAで視聴
              </a>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-lg">ABEMA動画を読み込み中...</div>
          </div>
        )}
      </div>

      <section className="mx-auto w-[95vw] max-w-5xl py-7 text-left">
        <Link className="text-sm text-emerald-300 hover:text-emerald-200" href="/">
          ← ホームへ戻る
        </Link>

        <div className="mt-4 flex flex-wrap items-start gap-5">
          {program?.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={program.thumbnailUrl}
              alt=""
              className="hidden h-28 w-48 flex-none rounded-lg object-cover ring-1 ring-white/10 sm:block"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {program?.genreName ? (
                <span className="rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold text-emerald-950">{program.genreName}</span>
              ) : null}
              {program?.isFree ? (
                <span className="rounded border border-emerald-400/60 px-2 py-0.5 text-xs font-bold text-emerald-300">無料</span>
              ) : null}
              {isPremium ? (
                <span className="rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">有料</span>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-bold leading-snug">{heading}</h1>
            {subParts.length > 0 ? (
              <p className="mt-1 text-sm text-gray-300">{subParts.join('・')}</p>
            ) : null}
            {program?.description ? (
              <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{program.description}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {program?.seriesId ? (
                <Link
                  href={`/service/abema/series/${encodeURIComponent(program.seriesId)}`}
                  className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
                >
                  シリーズ・全話を見る
                </Link>
              ) : null}
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/25 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                ABEMA公式で開く
              </a>
            </div>
          </div>
        </div>
      </section>

      {program?.seriesId ? (
        <AbemaWatchSeriesBar seriesId={program.seriesId} currentEpisodeId={slotId} />
      ) : null}
    </main>
  );
}

export default AbemaWatchPage;
