'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useAbemaSeries } from '@/hooks/useAbemaSeries';

function AbemaSeriesPage(props: { params: Promise<{ seriesId: string }> }) {
  const { seriesId } = use(props.params);
  const { data, loading, error } = useAbemaSeries(seriesId);
  const [activeSeason, setActiveSeason] = useState(0);

  const seasons = data?.seasons ?? [];
  const season = seasons[activeSeason] ?? seasons[0];

  return (
    <main className="min-h-screen bg-[#02110a] text-[#e7f5ec]">
      <div className="mx-auto w-[94vw] max-w-5xl py-8">
        <Link className="text-sm text-emerald-300 hover:text-emerald-200" href="/">
          ← ホームへ戻る
        </Link>

        {loading ? (
          <div className="mt-10 text-center text-[#9fc7b1]">シリーズ情報を読み込み中…</div>
        ) : error || !data ? (
          <div className="mt-10 rounded-xl border border-[#0e3322] bg-[#04190f] p-8 text-center text-[#9fc7b1]">
            シリーズ情報を取得できませんでした。
          </div>
        ) : (
          <>
            <header className="mt-5 flex flex-wrap items-start gap-5">
              {data.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.thumbnailUrl}
                  alt=""
                  className="hidden h-32 w-56 flex-none rounded-xl object-cover ring-1 ring-emerald-500/20 sm:block"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                {data.genreName ? (
                  <span className="rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold text-emerald-950">{data.genreName}</span>
                ) : null}
                <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">{data.title}</h1>
                {data.description ? (
                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#9fc7b1]">{data.description}</p>
                ) : null}
              </div>
            </header>

            {seasons.length > 1 ? (
              <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="シーズン">
                {seasons.map((s, index) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeSeason}
                    onClick={() => setActiveSeason(index)}
                    className={
                      index === activeSeason
                        ? 'rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold text-emerald-950'
                        : 'rounded-full border border-[#176040] px-4 py-1.5 text-sm font-semibold text-[#a5d8bd] hover:border-emerald-400'
                    }
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            ) : null}

            <section className="mt-6" aria-label={season?.name}>
              {seasons.length <= 1 && season?.name ? (
                <h2 className="mb-3 text-lg font-bold">{season.name}</h2>
              ) : null}
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {(season?.episodes ?? []).map((ep) => (
                  <li key={ep.id}>
                    <Link
                      href={`/service/abema/watch/${encodeURIComponent(ep.id)}`}
                      className="group flex items-center gap-3 rounded-xl border border-[#0e3322] bg-[#04190f] px-3 py-2.5 transition hover:border-emerald-400"
                    >
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#04321e] text-sm font-bold text-emerald-300">
                        {typeof ep.number === 'number' ? ep.number : '▶'}
                      </span>
                      <span className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-snug text-[#e7f5ec] group-hover:text-emerald-200">
                        {ep.title || `第${ep.number ?? ''}話`}
                      </span>
                      {ep.isFree ? (
                        <span className="flex-none rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950">無料</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
              {(season?.episodes ?? []).length === 0 ? (
                <p className="mt-6 text-center text-[#9fc7b1]">配信中の話数が見つかりませんでした。</p>
              ) : null}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default AbemaSeriesPage;
