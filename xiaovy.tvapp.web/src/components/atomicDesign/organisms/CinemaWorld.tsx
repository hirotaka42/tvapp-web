'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CinemaChips,
  CinemaFooter,
  CinemaHero,
  CinemaNewsList,
  CinemaRankingShelf,
  CinemaScheduleGrid,
  CinemaShelf,
  CinemaTicker,
} from '@/components/atomicDesign/molecules/cinema/CinemaParts';
import { CinemaHomeResponse, CinemaScheduleMonth, MovieCard } from '@/types/cinema';
import { jstToday } from '@/utils/cinema/status';

const WANT_KEY = 'cinema-wants-v1';

type ScheduleView = 'timeline' | 'calendar';

// 認証: 既存サービス(useAbemaHome 等)と同じく localStorage の ID トークンを Bearer で送る。
// /api/ は middleware で Bearer 必須。未ログイン時は 'anonymous'(存在チェックのみ通過)。
async function cinemaFetch(url: string): Promise<Response> {
  let token = 'anonymous';
  if (typeof window !== 'undefined') {
    token = window.localStorage.getItem(process.env.NEXT_PUBLIC_IDTOKEN_NAME || 'IdToken') || 'anonymous';
  }
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
}

function addMonths(ym: string, delta: number): string {
  const [year, month] = ym.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function readWants(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WANT_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

function persistWants(slugs: Set<string>) {
  try {
    window.localStorage.setItem(WANT_KEY, JSON.stringify(Array.from(slugs)));
  } catch {
    // localStorage が使えない環境では印を保持しない。
  }
}

function filterMovies(movies: MovieCard[], status: string, genre: string): MovieCard[] {
  return movies.filter((movie) => {
    if (status !== 'all' && movie.status !== status) return false;
    if (genre !== 'all' && !movie.genres.includes(genre)) return false;
    return true;
  });
}

export function CinemaWorld({ data, today = jstToday() }: { data: CinemaHomeResponse; today?: string }) {
  const [status, setStatus] = useState('all');
  const [genre, setGenre] = useState('all');
  const [rankTab, setRankTab] = useState<'now' | 'expected'>('now');
  const [view, setView] = useState<ScheduleView>('timeline');
  const [selectedMonth, setSelectedMonth] = useState(data.scheduleMonths[0]?.ym || today.slice(0, 7));
  const [scheduleMonths, setScheduleMonths] = useState<Record<string, CinemaScheduleMonth>>(() => (
    Object.fromEntries(data.scheduleMonths.map((month) => [month.ym, month]))
  ));
  const [wantedSlugs, setWantedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setWantedSlugs(readWants());
  }, []);

  useEffect(() => {
    if (scheduleMonths[selectedMonth]) return;
    let cancelled = false;
    cinemaFetch(`/api/service/cinema/schedule?month=${encodeURIComponent(selectedMonth)}`)
      .then((response) => {
        if (!response.ok) throw new Error('schedule fetch failed');
        return response.json() as Promise<CinemaScheduleMonth>;
      })
      .then((month) => {
        if (!cancelled) setScheduleMonths((current) => ({ ...current, [month.ym]: month }));
      })
      .catch(() => {
        if (!cancelled) setScheduleMonths((current) => ({
          ...current,
          [selectedMonth]: { ym: selectedMonth, days: [] },
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [scheduleMonths, selectedMonth]);

  const genres = useMemo(() => (
    Array.from(new Set([...data.now, ...data.upcoming, ...data.undated].flatMap((movie) => movie.genres))).slice(0, 10)
  ), [data.now, data.undated, data.upcoming]);

  const hero = data.heroFilms[0] || data.now[0] || data.upcoming[0];
  const visibleNow = filterMovies(data.now, status, genre);
  const visibleUpcoming = filterMovies(data.upcoming, status, genre);
  const nextMonth = scheduleMonths[addMonths(today.slice(0, 7), 1)];
  const nextMonthMovies = nextMonth?.days.flatMap((day) => day.films) ?? data.upcoming.filter((movie) => (
    movie.releaseDate?.startsWith(addMonths(today.slice(0, 7), 1))
  ));

  const toggleWant = (slug: string) => {
    setWantedSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      persistWants(next);
      return next;
    });
  };

  return (
    <section className="world cinema-world" id="cn" role="tabpanel" aria-labelledby="dk-cinema" aria-label="映画 ホーム">
      <CinemaTicker movies={[...data.now, ...data.upcoming]} news={data.news} />
      <CinemaChips status={status} genre={genre} genres={genres} onStatus={setStatus} onGenre={setGenre} />
      <CinemaHero movie={hero} wanted={hero ? wantedSlugs.has(hero.slug) : false} onToggleWant={toggleWant} />
      <CinemaShelf
        title="今上映中"
        label="NOW SHOWING"
        movies={visibleNow}
        wantedSlugs={wantedSlugs}
        onToggleWant={toggleWant}
      />
      <CinemaScheduleGrid
        month={scheduleMonths[selectedMonth]}
        today={today}
        view={view}
        onView={setView}
        onPrev={() => setSelectedMonth((current) => addMonths(current, -1))}
        onNext={() => setSelectedMonth((current) => addMonths(current, 1))}
      />
      <CinemaShelf
        title="来月公開ラインアップ"
        label="NEXT MONTH"
        movies={filterMovies(nextMonthMovies.length > 0 ? nextMonthMovies : visibleUpcoming, 'all', genre).slice(0, 16)}
        poster
        wantedSlugs={wantedSlugs}
        onToggleWant={toggleWant}
      />
      <CinemaRankingShelf
        nowShowing={data.ranking.nowShowing}
        expected={data.ranking.expected}
        tab={rankTab}
        onTab={setRankTab}
      />
      <CinemaNewsList news={data.news} />
      {data.undated.length > 0 && (
        <CinemaShelf
          title="公開日未定"
          label="UNDATED"
          movies={filterMovies(data.undated, status, genre)}
          wantedSlugs={wantedSlugs}
          onToggleWant={toggleWant}
        />
      )}
      <CinemaFooter lastCrawledAt={data.lastCrawledAt} />
    </section>
  );
}

export function CinemaWorldContainer() {
  const [data, setData] = useState<CinemaHomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    cinemaFetch('/api/service/cinema/home')
      .then((response) => {
        if (!response.ok) throw new Error('映画データを取得できません');
        return response.json() as Promise<CinemaHomeResponse>;
      })
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '映画データを取得できません');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (error) {
    return (
      <section className="world cinema-world cinema-state" id="cn" role="tabpanel" aria-labelledby="dk-cinema" aria-label="映画 ホーム">
        <div className="cinema-state-box">
          <h1>映画データを取得できません</h1>
          <p>D1 の読み取りに失敗した可能性があります。時間をおいて再度お試しください。</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>再読み込み</button>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="world cinema-world cinema-state" id="cn" role="tabpanel" aria-labelledby="dk-cinema" aria-label="映画 ホーム">
        <div className="cinema-state-box">映画ワールドを読み込み中です。</div>
      </section>
    );
  }

  return <CinemaWorld data={data} />;
}
