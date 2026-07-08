'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CinemaChips,
  CinemaFooter,
  CinemaGenreSection,
  CinemaHero,
  CinemaNewsList,
  CinemaRankingShelf,
  CinemaShelf,
  CinemaTicker,
} from '@/components/atomicDesign/molecules/cinema/CinemaParts';
import { CinemaHomeResponse, MovieCard, RankRow } from '@/types/cinema';
import { jstToday } from '@/utils/cinema/status';

const WANT_KEY = 'cinema-wants-v1';

// 認証: 既存サービス(useAbemaHome 等)と同じく localStorage の ID トークンを Bearer で送る。
// /api/ は middleware で Bearer 必須。未ログイン時は 'anonymous'(存在チェックのみ通過)。
async function cinemaFetch(url: string): Promise<Response> {
  let token = 'anonymous';
  if (typeof window !== 'undefined') {
    token = window.localStorage.getItem(process.env.NEXT_PUBLIC_IDTOKEN_NAME || 'IdToken') || 'anonymous';
  }
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
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

function filterRanking(rows: RankRow[], genre: string): RankRow[] {
  if (genre === 'all') return rows;
  return rows.filter((row) => row.movie.genres.includes(genre));
}

export function CinemaWorld({ data, today = jstToday() }: { data: CinemaHomeResponse; today?: string }) {
  const [status, setStatus] = useState('all');
  const [genre, setGenre] = useState('all');
  const [rankTab, setRankTab] = useState<'now' | 'expected'>('now');
  const [wantedSlugs, setWantedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setWantedSlugs(readWants());
  }, []);

  // カテゴリは「作品が2本以上あるジャンル」だけを出す(1件だけの固有ジャンルはノイズになるため除外)。
  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const movie of [...data.now, ...data.upcoming, ...data.undated]) {
      for (const g of movie.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g)
      .slice(0, 10);
  }, [data.now, data.undated, data.upcoming]);

  const visibleNow = filterMovies(data.now, status, genre);
  const visibleUpcoming = filterMovies(data.upcoming, status, genre);
  const visibleUndated = filterMovies(data.undated, status, genre);
  const rankingNow = filterRanking(data.ranking.nowShowing, genre);
  const rankingExpected = filterRanking(data.ranking.expected, genre);

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
      <CinemaHero
        movies={data.heroFilms.length > 0 ? data.heroFilms : [...data.now, ...data.upcoming].slice(0, 6)}
        wantedSlugs={wantedSlugs}
        onToggleWant={toggleWant}
      />
      <CinemaShelf
        title="今上映中"
        label="NOW SHOWING"
        movies={visibleNow}
        wantedSlugs={wantedSlugs}
        onToggleWant={toggleWant}
      />
      <CinemaShelf
        title="近日公開ラインアップ"
        label="UPCOMING"
        movies={visibleUpcoming.slice(0, 16)}
        poster
        wantedSlugs={wantedSlugs}
        onToggleWant={toggleWant}
      />
      <CinemaRankingShelf
        nowShowing={rankingNow}
        expected={rankingExpected}
        tab={rankTab}
        onTab={setRankTab}
      />
      <CinemaGenreSection
        genres={genres}
        selectedGenre={genre}
        movies={[...data.now, ...data.upcoming]}
        wantedSlugs={wantedSlugs}
        onToggleWant={toggleWant}
        onGenre={setGenre}
      />
      <CinemaNewsList news={data.news} />
      {data.undated.length > 0 && (
        <CinemaShelf
          title="公開日未定"
          label="UNDATED"
          movies={visibleUndated}
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
