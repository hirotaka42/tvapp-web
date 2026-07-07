'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  CinemaScheduleMonth,
  MovieCard,
  NewsItem,
  RankRow,
} from '@/types/cinema';

type ScheduleView = 'timeline' | 'calendar';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatDate(date?: string | null): string {
  if (!date) return '公開日未定';
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}/${day}(${weekday})`;
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split('-').map(Number);
  return `${year}年${month}月`;
}

function statusLabel(movie: MovieCard): string {
  if (movie.status === 'postponed') return '延期';
  if (movie.status === 'undated') return '公開日未定';
  if (movie.status === 'upcoming') return movie.daysUntil != null ? `公開まであと${movie.daysUntil}日` : '近日公開';
  if (movie.status === 'now_showing') return movie.daysSince != null ? `公開${movie.daysSince}日目` : '上映中';
  return '上映終了';
}

function scaleLabel(scale?: MovieCard['releaseScale']): string {
  if (scale === 'wide') return '全国公開';
  if (scale === 'limited') return '限定公開';
  return '公開規模未定';
}

function movieMeta(movie: MovieCard): string {
  return [
    movie.director ? `${movie.director} 監督` : null,
    movie.runtimeMin ? `${movie.runtimeMin}分` : null,
    movie.rating,
  ].filter(Boolean).join(' / ');
}

function openTrailer(titleJa: string) {
  window.open(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${titleJa} 予告編`)}`,
    '_blank',
    'noopener,noreferrer',
  );
}

function safeExternalHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 5.2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5a2.2 2.2 0 0 0 0 4.6v1.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a2.2 2.2 0 0 0 0-4.6V5.2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.2v9.6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 1.8v10.4L12 7 3 1.8Z" fill="currentColor" />
    </svg>
  );
}

export function CinemaArtwork({
  movie,
  variant = 'wide',
  className = '',
}: {
  movie: MovieCard;
  variant?: 'wide' | 'poster' | 'hero';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const rawSrc = variant === 'hero'
    ? movie.keyvisualUrl || movie.posterUrl
    : movie.posterUrl || movie.keyvisualUrl;
  const src = safeExternalHref(rawSrc);

  return (
    <div className={`cinema-art cinema-art-${variant} ${className}`}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : null}
      <div className="cinema-art-fallback" aria-hidden={src && !failed ? 'true' : 'false'}>
        <span>{movie.titleJa}</span>
      </div>
      <span className="cinema-art-title">{movie.titleJa}</span>
    </div>
  );
}

export function CinemaWantButton({
  movie,
  wanted,
  onToggle,
  compact = false,
}: {
  movie: MovieCard;
  wanted: boolean;
  onToggle: (slug: string) => void;
  compact?: boolean;
}) {
  const baseCount = movie.wantToWatch ?? 0;
  return (
    <button
      type="button"
      className={`cinema-want ${compact ? 'compact' : ''}`}
      aria-pressed={wanted}
      onClick={() => onToggle(movie.slug)}
    >
      <TicketIcon />
      <span>観たい</span>
      {!compact && <b>{(baseCount + (wanted ? 1 : 0)).toLocaleString('ja-JP')}人</b>}
    </button>
  );
}

export function CinemaTicker({ movies, news }: { movies: MovieCard[]; news: NewsItem[] }) {
  const items = [
    ...movies.slice(0, 4).map((movie) => ({
      label: movie.status === 'now_showing' ? '上映中' : '公開予定',
      text: `${movie.titleJa} ${statusLabel(movie)}`,
    })),
    ...news.slice(0, 3).map((item) => ({
      label: item.category ? item.category.replace('_', ' ') : '映画ニュース',
      text: item.title,
    })),
  ].slice(0, 6);

  if (items.length === 0) return null;

  const sequence = items.map((item, index) => (
    <span key={`${item.label}-${index}`}>
      <b>{item.label}</b>
      {item.text}
    </span>
  ));

  return (
    <div className="cinema-tick" aria-hidden="true">
      <div className="cinema-tick-in">
        <div className="cinema-tick-seq">{sequence}</div>
        <div className="cinema-tick-seq">{sequence}</div>
      </div>
    </div>
  );
}

export function CinemaChips({
  status,
  genre,
  genres,
  onStatus,
  onGenre,
}: {
  status: string;
  genre: string;
  genres: string[];
  onStatus: (status: string) => void;
  onGenre: (genre: string) => void;
}) {
  return (
    <div className="wrap cinema-gnav" aria-label="映画の絞り込み">
      {[
        ['all', 'すべて'],
        ['now_showing', '上映中'],
        ['upcoming', 'まもなく公開'],
        ['undated', '日付未定'],
      ].map(([value, label]) => (
        <button key={value} type="button" aria-pressed={status === value} onClick={() => onStatus(value)}>
          {label}
        </button>
      ))}
      <button type="button" aria-pressed={genre === 'all'} onClick={() => onGenre('all')}>全ジャンル</button>
      {genres.map((item) => (
        <button key={item} type="button" aria-pressed={genre === item} onClick={() => onGenre(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

export function CinemaHero({
  movie,
  wanted,
  onToggleWant,
}: {
  movie?: MovieCard;
  wanted: boolean;
  onToggleWant: (slug: string) => void;
}) {
  if (!movie) {
    return (
      <section className="cinema-hero wrap" aria-label="注目の一本">
        <div className="cinema-empty">注目作品を読み込み中です。</div>
      </section>
    );
  }

  return (
    <section className="cinema-hero wrap" aria-label="注目の一本">
      <div className="cinema-hero-in">
        <div className="cinema-hero-copy">
          <span className="cinema-hero-k">
            <i aria-hidden="true" />
            {movie.status === 'upcoming' ? '公開予定' : '上映中'} {statusLabel(movie)}
          </span>
          <h1>{movie.titleJa}</h1>
          <p className="cinema-hero-cp">
            {movie.overview || '劇場公開情報をもとに、いま観られる作品とこれから始まる作品をまとめています。'}
          </p>
          <ul className="cinema-hero-meta">
            {movie.director && <li>{movie.director} 監督</li>}
            {movie.cast.length > 0 && <li>{movie.cast.slice(0, 3).join('、')}</li>}
            {movie.runtimeMin && <li>{movie.runtimeMin}分</li>}
            {movie.screeningFormats.slice(0, 3).map((format) => <li key={format}>{format}</li>)}
          </ul>
          <div className="cinema-hero-cta">
            <button type="button" className="cinema-btn cinema-btn-primary" onClick={() => openTrailer(movie.titleJa)}>
              <PlayIcon />
              予告編を見る
            </button>
            <CinemaWantButton movie={movie} wanted={wanted} onToggle={onToggleWant} />
          </div>
        </div>
        <div className="cinema-hero-art" aria-label={`${movie.titleJa} キーアート`}>
          <CinemaArtwork movie={movie} variant="hero" />
          <div className="cinema-reel" aria-hidden="true"><i /><i /><i /><i /></div>
          <p className="cinema-poster-title">
            <b>{movie.titleJa}</b>
            <span>{movie.titleOriginal || movie.trailerQuery}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function CinemaMovieCard({
  movie,
  poster = false,
  wanted,
  onToggleWant,
}: {
  movie: MovieCard;
  poster?: boolean;
  wanted: boolean;
  onToggleWant: (slug: string) => void;
}) {
  return (
    <article className="cinema-card">
      <div className="cinema-clk">
        <CinemaArtwork movie={movie} variant={poster ? 'poster' : 'wide'} />
        <div className="cinema-cm">
          {poster && movie.releaseDate && (
            <p className="cinema-datebig">{formatDate(movie.releaseDate)}</p>
          )}
          <h3>{movie.titleJa}</h3>
          <p className="cinema-st">{movieMeta(movie) || movie.titleOriginal || '作品情報を確認中です'}</p>
          <p className="cinema-lf">{statusLabel(movie)}</p>
          <div className="cinema-mrow">
            {movie.genres.slice(0, 2).map((item) => <span className="cinema-mini" key={item}>{item}</span>)}
            {movie.rating && <span className="cinema-mini">{movie.rating}</span>}
            <span className="cinema-mini">{scaleLabel(movie.releaseScale)}</span>
          </div>
          <div className="cinema-card-actions">
            <button type="button" className="cinema-linkbtn" onClick={() => openTrailer(movie.titleJa)}>予告編</button>
            <CinemaWantButton movie={movie} wanted={wanted} onToggle={onToggleWant} compact />
          </div>
        </div>
      </div>
    </article>
  );
}

export function CinemaShelf({
  title,
  label,
  movies,
  poster = false,
  wantedSlugs,
  onToggleWant,
}: {
  title: string;
  label: string;
  movies: MovieCard[];
  poster?: boolean;
  wantedSlugs: Set<string>;
  onToggleWant: (slug: string) => void;
}) {
  return (
    <section className="cinema-sec wrap">
      <div className="cinema-sech">
        <h2>{title}</h2>
        <span className="cinema-cnt">{label}</span>
      </div>
      {movies.length > 0 ? (
        <div className="cinema-row">
          {movies.map((movie) => (
            <CinemaMovieCard
              key={movie.slug}
              movie={movie}
              poster={poster}
              wanted={wantedSlugs.has(movie.slug)}
              onToggleWant={onToggleWant}
            />
          ))}
        </div>
      ) : (
        <div className="cinema-empty">条件に合う作品はまだありません。</div>
      )}
    </section>
  );
}

export function CinemaScheduleGrid({
  month,
  today,
  view,
  onView,
  onPrev,
  onNext,
}: {
  month?: CinemaScheduleMonth;
  today: string;
  view: ScheduleView;
  onView: (view: ScheduleView) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const films = useMemo(() => month?.days.flatMap((day) => day.films.map((film) => ({ film, date: day.date }))) ?? [], [month]);
  const lanes = [
    { key: 'wide', label: '全国公開', test: (movie: MovieCard) => movie.releaseScale === 'wide' },
    { key: 'limited', label: '限定公開', test: (movie: MovieCard) => movie.releaseScale === 'limited' },
    { key: 'other', label: '公開予定', test: (movie: MovieCard) => movie.releaseScale !== 'wide' && movie.releaseScale !== 'limited' },
  ];
  const todayIndex = month && today.startsWith(month.ym) ? Number(today.slice(8, 10)) - 1 : -20;

  return (
    <section className="cinema-sec wrap">
      <div className="cinema-sech">
        <h2>公開スケジュール</h2>
        <div className="cinema-tools">
          <button type="button" className="cinema-navbtn" aria-label="前の月" onClick={onPrev}>‹</button>
          <b className="cinema-month">{month ? formatMonth(month.ym) : '読み込み中'}</b>
          <button type="button" className="cinema-navbtn" aria-label="次の月" onClick={onNext}>›</button>
          <div className="cinema-view">
            <button type="button" aria-pressed={view === 'timeline'} onClick={() => onView('timeline')}>タイムライン</button>
            <button type="button" aria-pressed={view === 'calendar'} onClick={() => onView('calendar')}>カレンダー</button>
          </div>
        </div>
      </div>
      <div className={`cinema-schedule ${view}`} style={{ '--cinema-today': todayIndex } as CSSProperties}>
        {month ? (
          <>
            <div className="cinema-epg-wrap" aria-hidden={view !== 'timeline'}>
              <div className="cinema-epg-grid" style={{ gridTemplateColumns: `128px repeat(${month.days.length}, 44px)` }}>
                <div className="cinema-epg-head">公開規模</div>
                {month.days.map((day) => (
                  <div className="cinema-epg-day" key={day.date}>{Number(day.date.slice(8))}<small>{day.weekday}</small></div>
                ))}
                {lanes.map((lane) => (
                  <div className="contents" key={lane.key}>
                    <div className="cinema-rowlabel">{lane.label}</div>
                    {month.days.map((day) => {
                      const dayFilms = day.films.filter(lane.test);
                      return (
                        <div className="cinema-epg-cell" key={`${lane.key}-${day.date}`}>
                          {dayFilms.slice(0, 2).map((movie) => (
                            <button key={movie.slug} type="button" className={`cinema-epg-program ${movie.status === 'now_showing' ? 'on' : ''}`} onClick={() => openTrailer(movie.titleJa)}>
                              {movie.titleJa}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="cinema-cal" aria-hidden={view !== 'calendar'}>
              {month.days.map((day) => (
                <div className="cinema-calday" key={day.date}>
                  <b>{Number(day.date.slice(8))}<small>{day.weekday}</small></b>
                  {day.films.length > 0 && <span className="cinema-badge">{day.films.length}本</span>}
                  {day.films.slice(0, 3).map((movie) => <p key={movie.slug}>{movie.titleJa}</p>)}
                </div>
              ))}
            </div>
            <div className="cinema-daily">
              {(films.length > 0 ? films : []).slice(0, 24).map(({ film, date }) => (
                <article className="cinema-daycard" key={`${date}-${film.slug}`}>
                  <b>{formatDate(date)} {statusLabel(film)}</b>
                  <p>{film.titleJa}</p>
                  <span>{[film.genres[0], scaleLabel(film.releaseScale)].filter(Boolean).join(' / ')}</span>
                </article>
              ))}
              {films.length === 0 && <article className="cinema-daycard"><b>公開予定</b><p>この月の公開作はまだありません。</p></article>}
            </div>
          </>
        ) : (
          <div className="cinema-empty">公開スケジュールを読み込み中です。</div>
        )}
      </div>
    </section>
  );
}

export function CinemaRankingShelf({
  nowShowing,
  expected,
  tab,
  onTab,
}: {
  nowShowing: RankRow[];
  expected: RankRow[];
  tab: 'now' | 'expected';
  onTab: (tab: 'now' | 'expected') => void;
}) {
  const rows = tab === 'now' ? nowShowing : expected;
  return (
    <section className="cinema-sec wrap">
      <div className="cinema-sech">
        <h2>人気ランキング</h2>
        <div className="cinema-tools">
          <div className="cinema-seg">
            <button type="button" aria-pressed={tab === 'now'} onClick={() => onTab('now')}>上映中</button>
            <button type="button" aria-pressed={tab === 'expected'} onClick={() => onTab('expected')}>期待度</button>
          </div>
        </div>
      </div>
      {rows.length > 0 ? (
        <div className="cinema-rankgrid">
          {rows.map((row) => (
            <article className="cinema-rankitem" key={`${row.metric}-${row.movie.slug}`}>
              <span className={`cinema-rk r${row.rank}`}>{row.rank}</span>
              <div>
                <h3>{row.movie.titleJa}</h3>
                <p>{row.metric === 'rating_avg' ? '平均評価' : '観たい'} {row.value.toLocaleString('ja-JP')}</p>
              </div>
              <button type="button" className="cinema-score" onClick={() => openTrailer(row.movie.titleJa)}>予告編</button>
            </article>
          ))}
        </div>
      ) : (
        <div className="cinema-empty">ランキングは集計中です。</div>
      )}
    </section>
  );
}

export function CinemaNewsList({ news }: { news: NewsItem[] }) {
  return (
    <section className="cinema-sec wrap">
      <div className="cinema-sech">
        <h2>映画ニュース</h2>
        <span className="cinema-cnt">これから系のみ</span>
      </div>
      {news.length > 0 ? (
        <div className="cinema-newsgrid">
          {news.slice(0, 8).map((item) => {
            const href = safeExternalHref(item.url);
            const thumbnailUrl = safeExternalHref(item.thumbnailUrl);
            const body = (
              <>
                <div className="cinema-news-thumb">
                  {thumbnailUrl ? <img src={thumbnailUrl} alt="" loading="lazy" /> : null}
                  <span>{item.category || '映画ニュース'}</span>
                </div>
                <div className="cinema-cm">
                  <span className="cinema-mini">{item.source}</span>
                  <h3>{item.title}</h3>
                  <p className="cinema-st">{item.summary || item.publishedAt}</p>
                </div>
              </>
            );
            return (
              <article className="cinema-news" key={`${item.source}-${item.publishedAt}-${item.title}`}>
                {href ? <a href={href} target="_blank" rel="noreferrer">{body}</a> : <div>{body}</div>}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="cinema-empty">映画ニュースはまだありません。</div>
      )}
    </section>
  );
}

export function CinemaFooter({ lastCrawledAt }: { lastCrawledAt: string | null }) {
  return (
    <footer className="cinema-ft">
      <p>情報提示のみ・予約/購入は扱いません</p>
      <p>最終更新 {lastCrawledAt || '未取得'}</p>
      <p>データ出典: 劇場公開情報、作品ページ、映画ニュースフィード</p>
    </footer>
  );
}
