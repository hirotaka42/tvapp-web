import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  CinemaDatePrecision,
  CinemaHomeResponse,
  CinemaRating,
  CinemaReleaseScale,
  CinemaScheduleMonth,
  MovieCard,
  NewsItem,
  RankRow,
} from '@/types/cinema';
import { deriveCinemaStatus, jstToday } from '@/utils/cinema/status';

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface MovieRow {
  id: number;
  slug: string;
  titleJa: string;
  titleOriginal: string | null;
  overview: string | null;
  runtimeMin: number | null;
  rating: CinemaRating | null;
  genresJson: string | null;
  screeningFormatsJson: string | null;
  releaseDate: string | null;
  datePrecision: CinemaDatePrecision;
  isPostponed: number;
  releaseScale: CinemaReleaseScale | null;
  nowShowing: number;
  posterUrl: string | null;
  keyvisualUrl: string | null;
}

interface CreditRow {
  movieId: number;
  role: 'director' | 'cast';
  personName: string;
}

interface SourceRow {
  movieId: number;
  sourceUrl: string;
}

interface PopularityRow {
  movieId: number;
  metric: 'want_to_watch' | 'rating_avg' | 'rating_count';
  value: number;
}

interface NewsRow {
  id: number;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  publishedAt: string;
  category: string | null;
  thumbnailUrl: string | null;
}

interface RelatedNewsRow {
  newsId: number;
  slug: string;
}

const MOVIE_COLUMNS = `
  id,
  slug,
  title_ja AS titleJa,
  title_original AS titleOriginal,
  overview,
  runtime_min AS runtimeMin,
  rating,
  genres_json AS genresJson,
  screening_formats_json AS screeningFormatsJson,
  release_date AS releaseDate,
  date_precision AS datePrecision,
  is_postponed AS isPostponed,
  release_scale AS releaseScale,
  now_showing AS nowShowing,
  poster_url AS posterUrl,
  keyvisual_url AS keyvisualUrl
`;

export function getMovieDb(): D1Database {
  const context = getCloudflareContext() as { env?: { MOVIE_DB?: D1Database } };
  const db = context.env?.MOVIE_DB;
  if (!db) {
    throw new Error('MOVIE_DB binding is not configured');
  }
  return db;
}

export function jsonError(error: unknown): { error: string } {
  return { error: error instanceof Error ? error.message : 'Internal Server Error' };
}

async function all<T>(db: D1Database, sql: string, params: unknown[] = []): Promise<T[]> {
  const statement = params.length ? db.prepare(sql).bind(...params) : db.prepare(sql);
  const result = await statement.all<T>();
  return result.results ?? [];
}

function parseStringArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
  } catch {
    return [];
  }
}

export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => '?').join(',');
}

function uniqueIds(rows: MovieRow[]): number[] {
  return Array.from(new Set(rows.map((row) => row.id)));
}

// D1 のバインドパラメータ上限は 100。IN 句の作品IDはチャンク分割して上限超過を防ぐ。
const ID_CHUNK = 90;
function chunkIds(ids: number[]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK) out.push(ids.slice(i, i + ID_CHUNK));
  return out;
}

async function readCredits(db: D1Database, ids: number[]): Promise<Map<number, { director: string | null; cast: string[] }>> {
  const credits = new Map<number, { director: string | null; cast: string[] }>();
  for (const id of ids) credits.set(id, { director: null, cast: [] });
  if (ids.length === 0) return credits;
  for (const chunk of chunkIds(ids)) {
    const rows = await all<CreditRow>(
      db,
      `SELECT movie_id AS movieId, role, person_name AS personName
       FROM movie_credits
       WHERE movie_id IN (${placeholders(chunk.length)})
       ORDER BY movie_id, role, COALESCE(billing_order, 999), id`,
      chunk,
    );
    for (const row of rows) {
      const entry = credits.get(row.movieId) ?? { director: null, cast: [] };
      if (row.role === 'director' && !entry.director) entry.director = row.personName;
      if (row.role === 'cast' && entry.cast.length < 6) entry.cast.push(row.personName);
      credits.set(row.movieId, entry);
    }
  }
  return credits;
}

async function readSources(db: D1Database, ids: number[]): Promise<Map<number, string>> {
  const sources = new Map<number, string>();
  if (ids.length === 0) return sources;
  for (const chunk of chunkIds(ids)) {
    const rows = await all<SourceRow>(
      db,
      `SELECT movie_id AS movieId, source_url AS sourceUrl
       FROM movie_source_ids
       WHERE movie_id IN (${placeholders(chunk.length)}) AND source_url IS NOT NULL
       ORDER BY movie_id, source`,
      chunk,
    );
    for (const row of rows) {
      if (!sources.has(row.movieId)) sources.set(row.movieId, row.sourceUrl);
    }
  }
  return sources;
}

async function readPopularity(db: D1Database, ids: number[]): Promise<Map<number, Partial<Pick<MovieCard, 'wantToWatch' | 'ratingAvg' | 'ratingCount'>>>> {
  const popularity = new Map<number, Partial<Pick<MovieCard, 'wantToWatch' | 'ratingAvg' | 'ratingCount'>>>();
  if (ids.length === 0) return popularity;
  for (const chunk of chunkIds(ids)) {
    const rows = await all<PopularityRow>(
      db,
      `WITH latest AS (
         SELECT movie_id, metric, MAX(snapshot_date) AS snapshot_date
         FROM popularity_snapshots
         WHERE movie_id IN (${placeholders(chunk.length)}) AND metric IN ('want_to_watch','rating_avg','rating_count')
         GROUP BY movie_id, metric
       )
       SELECT p.movie_id AS movieId, p.metric, p.value
       FROM popularity_snapshots p
       JOIN latest l
         ON l.movie_id = p.movie_id AND l.metric = p.metric AND l.snapshot_date = p.snapshot_date`,
      chunk,
    );
    for (const row of rows) {
      const entry = popularity.get(row.movieId) ?? {};
      if (row.metric === 'want_to_watch') entry.wantToWatch = row.value;
      if (row.metric === 'rating_avg') entry.ratingAvg = row.value;
      if (row.metric === 'rating_count') entry.ratingCount = row.value;
      popularity.set(row.movieId, entry);
    }
  }
  return popularity;
}

export async function mapMovies(db: D1Database, rows: MovieRow[], today = jstToday()): Promise<MovieCard[]> {
  const ids = uniqueIds(rows);
  const [credits, sources, popularity] = await Promise.all([
    readCredits(db, ids),
    readSources(db, ids),
    readPopularity(db, ids),
  ]);

  return rows.map((row) => {
    const status = deriveCinemaStatus({
      releaseDate: row.releaseDate,
      datePrecision: row.datePrecision,
      isPostponed: row.isPostponed,
      nowShowing: row.nowShowing,
    }, today);
    const credit = credits.get(row.id);
    const pop = popularity.get(row.id);

    return {
      slug: row.slug,
      titleJa: row.titleJa,
      titleOriginal: row.titleOriginal,
      overview: row.overview,
      runtimeMin: row.runtimeMin,
      rating: row.rating,
      genres: parseStringArray(row.genresJson),
      screeningFormats: parseStringArray(row.screeningFormatsJson),
      releaseDate: row.releaseDate,
      datePrecision: row.datePrecision,
      releaseScale: row.releaseScale,
      posterUrl: safeExternalUrl(row.posterUrl),
      keyvisualUrl: safeExternalUrl(row.keyvisualUrl),
      status: status.status,
      daysUntil: status.daysUntil ?? null,
      daysSince: status.daysSince ?? null,
      director: credit?.director ?? null,
      cast: credit?.cast ?? [],
      wantToWatch: pop?.wantToWatch ?? null,
      ratingAvg: pop?.ratingAvg ?? null,
      ratingCount: pop?.ratingCount ?? null,
      sourceUrl: safeExternalUrl(sources.get(row.id)),
      trailerQuery: `${row.titleJa} 予告編`,
    };
  });
}

export async function readNowShowing(db: D1Database, today = jstToday(), limit = 24): Promise<MovieCard[]> {
  const rows = await all<MovieRow>(
    db,
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE is_streaming_only = 0
       AND now_showing = 1
       AND release_date IS NOT NULL
       AND release_date <= ?
     ORDER BY release_date DESC, updated_at DESC
     LIMIT ?`,
    [today, limit],
  );
  return mapMovies(db, rows, today);
}

export async function readUpcoming(db: D1Database, today = jstToday(), limit = 24): Promise<MovieCard[]> {
  const rows = await all<MovieRow>(
    db,
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE is_streaming_only = 0
       AND release_date > ?
       AND date_precision IN ('day','month')
       AND is_postponed = 0
     ORDER BY release_date ASC, updated_at DESC
     LIMIT ?`,
    [today, limit],
  );
  return mapMovies(db, rows, today);
}

export async function readUndated(db: D1Database, today = jstToday(), limit = 24): Promise<MovieCard[]> {
  const rows = await all<MovieRow>(
    db,
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE is_streaming_only = 0
       AND now_showing = 0
       AND (release_date IS NULL OR date_precision IN ('year','unknown') OR is_postponed = 1)
     ORDER BY COALESCE(release_date, '9999-12-31') ASC, updated_at DESC
     LIMIT ?`,
    [limit],
  );
  return mapMovies(db, rows, today);
}

function addMonths(ym: string, delta: number): string {
  const [year, month] = ym.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function monthFromDate(date: string): string {
  return date.slice(0, 7);
}

function monthStart(ym: string): string {
  return `${ym}-01`;
}

function weekdayJa(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return '日月火水木金土'[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

function daysInMonth(ym: string): number {
  const [year, month] = ym.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function buildScheduleMonth(ym: string, films: MovieCard[]): CinemaScheduleMonth {
  const byDate = new Map<string, MovieCard[]>();
  for (const film of films) {
    if (!film.releaseDate) continue;
    const list = byDate.get(film.releaseDate) ?? [];
    list.push(film);
    byDate.set(film.releaseDate, list);
  }

  const days = Array.from({ length: daysInMonth(ym) }, (_, index) => {
    const date = `${ym}-${String(index + 1).padStart(2, '0')}`;
    return {
      date,
      weekday: weekdayJa(date),
      films: byDate.get(date) ?? [],
    };
  });

  return { ym, days };
}

export async function readScheduleMonth(db: D1Database, ym: string, today = jstToday()): Promise<CinemaScheduleMonth> {
  const start = monthStart(ym);
  const end = monthStart(addMonths(ym, 1));
  const rows = await all<MovieRow>(
    db,
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE is_streaming_only = 0
       AND release_date >= ?
       AND release_date < ?
       AND date_precision = 'day'
       AND is_postponed = 0
     ORDER BY release_date ASC, title_ja ASC
     LIMIT 240`,
    [start, end],
  );
  return buildScheduleMonth(ym, await mapMovies(db, rows, today));
}

export async function readScheduleMonths(db: D1Database, today = jstToday(), count = 3): Promise<CinemaScheduleMonth[]> {
  const firstYm = monthFromDate(today);
  const months = Array.from({ length: count }, (_, index) => addMonths(firstYm, index));
  const start = monthStart(months[0]);
  const end = monthStart(addMonths(months[months.length - 1], 1));
  const rows = await all<MovieRow>(
    db,
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE is_streaming_only = 0
       AND release_date >= ?
       AND release_date < ?
       AND date_precision = 'day'
       AND is_postponed = 0
     ORDER BY release_date ASC, title_ja ASC
     LIMIT 720`,
    [start, end],
  );
  const films = await mapMovies(db, rows, today);
  return months.map((ym) => buildScheduleMonth(ym, films.filter((film) => film.releaseDate?.startsWith(ym))));
}

export async function readRanking(db: D1Database, type: 'now' | 'expected', today = jstToday(), limit = 10): Promise<RankRow[]> {
  const metric = type === 'now' ? 'rating_avg' : 'want_to_watch';
  const statusPredicate = type === 'now'
    ? 'm.now_showing = 1 AND m.release_date IS NOT NULL AND m.release_date <= ?'
    : "m.release_date > ? AND m.date_precision IN ('day','month') AND m.is_postponed = 0";
  const rows = await all<MovieRow & { metricValue: number }>(
    db,
    `WITH latest AS (
       SELECT movie_id, metric, MAX(snapshot_date) AS snapshot_date
       FROM popularity_snapshots
       WHERE metric = ?
       GROUP BY movie_id, metric
     )
     SELECT ${MOVIE_COLUMNS}, p.value AS metricValue
     FROM popularity_snapshots p
     JOIN latest l
       ON l.movie_id = p.movie_id AND l.metric = p.metric AND l.snapshot_date = p.snapshot_date
     JOIN movies m ON m.id = p.movie_id
     WHERE m.is_streaming_only = 0
       AND ${statusPredicate}
     ORDER BY p.value DESC, m.release_date ASC
     LIMIT ?`,
    [metric, today, limit],
  );
  const movies = await mapMovies(db, rows, today);
  return movies.map((movie, index) => ({
    rank: index + 1,
    movie,
    metric,
    value: rows[index]?.metricValue ?? 0,
    deltaRank: null,
  }));
}

export async function readNews(db: D1Database, category?: string | null, limit = 12): Promise<NewsItem[]> {
  const params: unknown[] = [];
  const categoryClause = category ? 'AND news_category = ?' : '';
  if (category) params.push(category);
  params.push(limit);
  const rows = await all<NewsRow>(
    db,
    `SELECT id, title, url, source, summary, published_at AS publishedAt, news_category AS category, thumbnail_url AS thumbnailUrl
     FROM movie_news
     WHERE is_forward_looking = 1
       ${categoryClause}
     ORDER BY published_at DESC
     LIMIT ?`,
    params,
  );

  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const relatedRows = await all<RelatedNewsRow>(
    db,
    `SELECT nmm.news_id AS newsId, m.slug
     FROM news_movie_map nmm
     JOIN movies m ON m.id = nmm.movie_id
     WHERE nmm.news_id IN (${placeholders(ids.length)})
     ORDER BY nmm.news_id, m.title_ja`,
    ids,
  );
  const related = new Map<number, string[]>();
  for (const row of relatedRows) {
    const list = related.get(row.newsId) ?? [];
    list.push(row.slug);
    related.set(row.newsId, list);
  }

  return rows.map((row) => ({
    title: row.title,
    url: safeExternalUrl(row.url),
    source: row.source,
    summary: row.summary,
    publishedAt: row.publishedAt,
    category: row.category,
    thumbnailUrl: safeExternalUrl(row.thumbnailUrl),
    relatedSlugs: related.get(row.id) ?? [],
  }));
}

export async function readLastCrawledAt(db: D1Database): Promise<string | null> {
  const row = await db.prepare(
    `SELECT finished_at AS finishedAt
     FROM ingest_runs
     WHERE finished_at IS NOT NULL
     ORDER BY finished_at DESC
     LIMIT 1`,
  ).first<{ finishedAt: string | null }>();
  return row?.finishedAt ?? null;
}

export async function readHome(db: D1Database, today = jstToday()): Promise<CinemaHomeResponse> {
  const [now, upcoming, scheduleMonths, undated, nowShowingRanking, expectedRanking, news, lastCrawledAt] = await Promise.all([
    readNowShowing(db, today),
    readUpcoming(db, today),
    readScheduleMonths(db, today),
    readUndated(db, today),
    readRanking(db, 'now', today),
    readRanking(db, 'expected', today),
    readNews(db),
    readLastCrawledAt(db),
  ]);

  const heroFilms = [...now, ...upcoming].filter((film, index, all) => (
    all.findIndex((candidate) => candidate.slug === film.slug) === index
  )).slice(0, 3);

  return {
    now,
    upcoming,
    scheduleMonths,
    undated,
    ranking: {
      nowShowing: nowShowingRanking,
      expected: expectedRanking,
    },
    news,
    heroFilms,
    lastCrawledAt,
  };
}

export function isValidMonth(value: string | null): value is string {
  return !!value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
