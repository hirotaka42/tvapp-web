"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { useAbemaStream } from '@/hooks/useAbemaStream';
import { externalAbemaWatchUrl } from '@/utils/abema/playbackUrl';

function AbemaWatchPage(props: { params: Promise<{ slotId: string }> }) {
  const { slotId } = use(props.params);
  const { data, error, retry } = useAbemaStream({ type: 'slot', slotId });
  const officialUrl = externalAbemaWatchUrl({ kind: 'watch', id: slotId });

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative mx-auto aspect-video w-full max-w-[min(100%,calc((100dvh-8rem)*16/9))]">
        {data ? (
          <VideoPlayer url={data.video_url} proxy="none" />
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-lg font-semibold">ABEMAを再生できませんでした</p>
            <p className="max-w-xl text-sm text-gray-300">{error.message}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={retry}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                再試行
              </button>
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
      <section className="mx-auto w-[95vw] max-w-5xl py-6 text-left">
        <Link className="text-sm text-blue-300 hover:text-blue-200" href="/">
          ホームへ戻る
        </Link>
        <h1 className="mt-3 text-2xl font-bold">ABEMA Program</h1>
        <p className="mt-2 text-gray-300">{slotId}</p>
      </section>
    </main>
  );
}

export default AbemaWatchPage;
