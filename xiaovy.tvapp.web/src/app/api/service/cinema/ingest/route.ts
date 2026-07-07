import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';

// runtime は既定(Node)。OpenNext(Cloudflare)は `runtime='edge'` を「別関数化が必要」で弾くため、
// 既存 abema ルートと同様に指定しない(nodejs_compat + getCloudflareContext で D1 を利用)。

type D1DatabaseLike = {
  prepare: (query: string) => { bind: (...values: unknown[]) => unknown };
  batch: (statements: unknown[]) => Promise<unknown[]>;
};

type IngestMovie = {
  slug: string;
  titleJa: string;
  titleOriginal?: string | null;
  overview?: string | null;
  runtimeMin?: number | null;
  rating?: 'G' | 'PG12' | 'R15+' | 'R18+' | null;
  genres?: string[];
  screeningFormats?: string[];
  releaseDate?: string | null;
  datePrecision?: 'day' | 'month' | 'year' | 'unknown';
  isPostponed?: boolean;
  releaseScale?: 'wide' | 'limited' | null;
  theaterCount?: number | null;
  nowShowing?: boolean;
  screeningEndDate?: string | null;
  isStreamingOnly?: boolean;
  posterUrl?: string | null;
  keyvisualUrl?: string | null;
  contentHash?: string | null;
  source?: string | null;
  sourceKey?: string | null;
  sourceUrl?: string | null;
  directors?: string[];
  cast?: string[];
};

type IngestNews = {
  guid: string;
  source: string;
  title: string;
  url: string;
  summary?: string | null;
  publishedAt: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  relatedSlugs?: string[];
  matchMethod?: string | null;
};

type IngestPop = {
  slug: string;
  source: string;
  metric: string;
  value: number;
  snapshotDate: string;
};

type IngestBody = {
  source: string;
  runDate: string;
  movies?: IngestMovie[];
  news?: IngestNews[];
  popularity?: IngestPop[];
};

const MAX_BATCH_QUERIES = 45;
const MAX_BATCH_PARAMS = 90;
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_ITEMS_PER_COLLECTION = 3000;
const MAX_TITLE_LENGTH = 500;
const MAX_OVERVIEW_LENGTH = 4000;
const MAX_URL_LENGTH = 2000;
const MAX_SUMMARY_LENGTH = 4000;
const MAX_SHORT_TEXT_LENGTH = 500;
const MAX_SLUG_LENGTH = 200;
const MAX_SOURCE_LENGTH = 100;
const MAX_ARRAY_TEXT_LENGTH = 100;

const VALID_RATINGS = new Set(['G', 'PG12', 'R15+', 'R18+']);
const VALID_DATE_PRECISIONS = new Set(['day', 'month', 'year', 'unknown']);
const VALID_RELEASE_SCALES = new Set(['wide', 'limited']);
const VALID_POPULARITY_METRICS = new Set(['want_to_watch', 'rating_avg', 'rating_count']);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isDateOnly(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIsoLikeDateTime(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}(?:[T ][0-2]\d:[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?(?:Z|[+-][0-2]\d:[0-5]\d)?)?$/.test(value);
}

function toJsonArray(value: unknown): string {
  return JSON.stringify(normalizeTextList(value, 20, MAX_ARRAY_TEXT_LENGTH));
}

function toIntFlag(value: unknown): number {
  return value ? 1 : 0;
}

function normalizeTextList(value: unknown, limit = 20, maxLength = MAX_ARRAY_TEXT_LENGTH): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.slice(0, maxLength))
    .slice(0, limit);
}

function textOrNull(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text ? text.slice(0, maxLength) : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function integerOrNull(value: unknown): number | null {
  const number = numberOrNull(value);
  return number == null ? null : Math.trunc(number);
}

function normalizeRating(value: unknown): IngestMovie['rating'] {
  return typeof value === 'string' && VALID_RATINGS.has(value) ? value as IngestMovie['rating'] : null;
}

function normalizeDatePrecision(value: unknown): NonNullable<IngestMovie['datePrecision']> {
  return typeof value === 'string' && VALID_DATE_PRECISIONS.has(value)
    ? value as NonNullable<IngestMovie['datePrecision']>
    : 'unknown';
}

function normalizeReleaseScale(value: unknown): IngestMovie['releaseScale'] {
  return typeof value === 'string' && VALID_RELEASE_SCALES.has(value) ? value as IngestMovie['releaseScale'] : null;
}

function contentLengthTooLarge(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) return false;
  const bytes = Number(contentLength);
  return Number.isFinite(bytes) && bytes > MAX_BODY_BYTES;
}

function validateCollectionLimits(body: IngestBody): string | null {
  if ((body.movies?.length ?? 0) > MAX_ITEMS_PER_COLLECTION) return 'Too many movies';
  if ((body.news?.length ?? 0) > MAX_ITEMS_PER_COLLECTION) return 'Too many news items';
  if ((body.popularity?.length ?? 0) > MAX_ITEMS_PER_COLLECTION) return 'Too many popularity items';
  return null;
}

function fallbackSlug(source: string | null | undefined, sourceKey: string | null | undefined): string | null {
  if (!source || !sourceKey) return null;
  const normalized = `${source}-${sourceKey}`
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || null;
}

function timingSafeEqualText(actual: string | null, expected: string | undefined): boolean {
  if (!actual || !expected) return false;

  const encoder = new TextEncoder();
  const a = encoder.encode(actual);
  const b = encoder.encode(expected);
  const length = Math.max(a.length, b.length, 1);
  let diff = a.length ^ b.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }

  return diff === 0;
}

async function flushBatch(db: D1DatabaseLike, statements: unknown[], force = false) {
  if (statements.length === 0 || (!force && statements.length < MAX_BATCH_QUERIES)) return;
  const chunk = statements.splice(0, statements.length);
  await db.batch(chunk);
}

function pushStatement(
  db: D1DatabaseLike,
  statements: unknown[],
  paramState: { count: number },
  sql: string,
  params: unknown[],
) {
  if (statements.length >= MAX_BATCH_QUERIES || paramState.count + params.length > MAX_BATCH_PARAMS) {
    return false;
  }
  statements.push(db.prepare(sql).bind(...params));
  paramState.count += params.length;
  return true;
}

async function addStatement(
  db: D1DatabaseLike,
  statements: unknown[],
  paramState: { count: number },
  sql: string,
  params: unknown[],
) {
  if (!pushStatement(db, statements, paramState, sql, params)) {
    await flushBatch(db, statements, true);
    paramState.count = 0;
    pushStatement(db, statements, paramState, sql, params);
  }
}

function validBody(body: unknown): body is IngestBody {
  if (!body || typeof body !== 'object') return false;
  const candidate = body as Partial<IngestBody>;
  return typeof candidate.source === 'string'
    && candidate.source.length > 0
    && isDateOnly(candidate.runDate)
    && (!candidate.movies || Array.isArray(candidate.movies))
    && (!candidate.news || Array.isArray(candidate.news))
    && (!candidate.popularity || Array.isArray(candidate.popularity));
}

export async function POST(request: NextRequest) {
  const startedAt = new Date().toISOString();

  try {
    const env = getCloudflareContext().env as unknown as Record<string, unknown>;
    const db = env.MOVIE_DB as D1DatabaseLike | undefined;
    const ingestSecret = env.INGEST_SECRET as string | undefined;

    if (!db) return jsonError('MOVIE_DB binding is not configured', 500);
    if (!timingSafeEqualText(request.headers.get('x-ingest-secret'), ingestSecret)) {
      return jsonError('Unauthorized', 401);
    }
    if (contentLengthTooLarge(request)) return jsonError('Payload Too Large', 413);

    const body = await request.json().catch(() => null);
    if (!validBody(body)) return jsonError('Invalid ingest body', 400);
    const limitError = validateCollectionLimits(body);
    if (limitError) return jsonError(limitError, 400);

    const statements: unknown[] = [];
    const paramState = { count: 0 };
    let moviesUpserted = 0;
    let newsUpserted = 0;
    let popularityUpserted = 0;

    for (const movie of body.movies ?? []) {
      if (!movie) continue;
      const rawMovie = movie as Record<string, unknown>;
      const source = textOrNull(rawMovie.source, MAX_SOURCE_LENGTH);
      const sourceKey = textOrNull(rawMovie.sourceKey, MAX_SHORT_TEXT_LENGTH);
      const slug = textOrNull(rawMovie.slug, MAX_SLUG_LENGTH) || fallbackSlug(source, sourceKey);
      const titleJa = textOrNull(rawMovie.titleJa, MAX_TITLE_LENGTH);
      if (!slug || !titleJa) continue;

      await addStatement(
        db,
        statements,
        paramState,
        `INSERT INTO movies (
          slug, title_ja, title_original, overview, runtime_min, rating,
          genres_json, screening_formats_json, release_date, date_precision,
          is_postponed, release_scale, theater_count, now_showing, screening_end_date,
          is_streaming_only, poster_url, keyvisual_url, content_hash, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))
        ON CONFLICT(slug) DO UPDATE SET
          title_ja=excluded.title_ja,
          title_original=excluded.title_original,
          overview=COALESCE(excluded.overview, movies.overview),
          runtime_min=COALESCE(excluded.runtime_min, movies.runtime_min),
          rating=COALESCE(excluded.rating, movies.rating),
          genres_json=excluded.genres_json,
          screening_formats_json=excluded.screening_formats_json,
          release_date=COALESCE(excluded.release_date, movies.release_date),
          date_precision=excluded.date_precision,
          is_postponed=excluded.is_postponed,
          release_scale=COALESCE(excluded.release_scale, movies.release_scale),
          theater_count=COALESCE(excluded.theater_count, movies.theater_count),
          now_showing=MAX(movies.now_showing, excluded.now_showing),
          screening_end_date=COALESCE(excluded.screening_end_date, movies.screening_end_date),
          is_streaming_only=MAX(movies.is_streaming_only, excluded.is_streaming_only),
          poster_url=COALESCE(excluded.poster_url, movies.poster_url),
          keyvisual_url=COALESCE(excluded.keyvisual_url, movies.keyvisual_url),
          content_hash=COALESCE(excluded.content_hash, movies.content_hash),
          updated_at=strftime('%Y-%m-%dT%H:%M:%SZ','now')`,
        [
          slug,
          titleJa,
          textOrNull(rawMovie.titleOriginal, MAX_TITLE_LENGTH),
          textOrNull(rawMovie.overview, MAX_OVERVIEW_LENGTH),
          integerOrNull(rawMovie.runtimeMin),
          normalizeRating(rawMovie.rating),
          toJsonArray(rawMovie.genres),
          toJsonArray(rawMovie.screeningFormats),
          isDateOnly(rawMovie.releaseDate) ? rawMovie.releaseDate : null,
          normalizeDatePrecision(rawMovie.datePrecision),
          toIntFlag(rawMovie.isPostponed),
          normalizeReleaseScale(rawMovie.releaseScale),
          integerOrNull(rawMovie.theaterCount),
          toIntFlag(rawMovie.nowShowing),
          isDateOnly(rawMovie.screeningEndDate) ? rawMovie.screeningEndDate : null,
          toIntFlag(rawMovie.isStreamingOnly),
          textOrNull(rawMovie.posterUrl, MAX_URL_LENGTH),
          textOrNull(rawMovie.keyvisualUrl, MAX_URL_LENGTH),
          textOrNull(rawMovie.contentHash, MAX_SHORT_TEXT_LENGTH),
        ],
      );
      moviesUpserted += 1;

      if (source && sourceKey) {
        await addStatement(
          db,
          statements,
          paramState,
          `INSERT INTO movie_source_ids (movie_id, source, source_key, source_url)
           SELECT id, ?, ?, ? FROM movies WHERE slug=?
           ON CONFLICT(source, source_key) DO UPDATE SET
             movie_id=excluded.movie_id,
             source_url=COALESCE(excluded.source_url, movie_source_ids.source_url)`,
          [source, sourceKey, textOrNull(rawMovie.sourceUrl, MAX_URL_LENGTH), slug],
        );
      }

      const directors = normalizeTextList(rawMovie.directors, 20, MAX_ARRAY_TEXT_LENGTH);
      const cast = normalizeTextList(rawMovie.cast, 20, MAX_ARRAY_TEXT_LENGTH);
      for (const director of directors) {
        await addStatement(
          db,
          statements,
          paramState,
          `INSERT OR IGNORE INTO movie_credits (movie_id, person_name, role, billing_order)
           SELECT id, ?, 'director', NULL FROM movies WHERE slug=?`,
          [director, slug],
        );
      }
      for (const [index, actor] of cast.entries()) {
        await addStatement(
          db,
          statements,
          paramState,
          `INSERT OR IGNORE INTO movie_credits (movie_id, person_name, role, billing_order)
           SELECT id, ?, 'cast', ? FROM movies WHERE slug=?`,
          [actor, index + 1, slug],
        );
      }
    }

    for (const item of body.news ?? []) {
      if (!item) continue;
      const rawItem = item as Record<string, unknown>;
      const guid = textOrNull(rawItem.guid, MAX_SHORT_TEXT_LENGTH);
      const source = textOrNull(rawItem.source, MAX_SOURCE_LENGTH);
      const title = textOrNull(rawItem.title, MAX_TITLE_LENGTH);
      const url = textOrNull(rawItem.url, MAX_URL_LENGTH);
      const publishedAt = textOrNull(rawItem.publishedAt, MAX_SHORT_TEXT_LENGTH);
      if (!guid || !source || !title || !url || !isIsoLikeDateTime(publishedAt)) continue;

      await addStatement(
        db,
        statements,
        paramState,
        `INSERT OR IGNORE INTO movie_news (
          guid, source, title, url, summary, published_at, news_category,
          is_forward_looking, thumbnail_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          guid,
          source,
          title,
          url,
          textOrNull(rawItem.summary, MAX_SUMMARY_LENGTH),
          publishedAt,
          textOrNull(rawItem.category, MAX_SHORT_TEXT_LENGTH),
          textOrNull(rawItem.thumbnailUrl, MAX_URL_LENGTH),
        ],
      );
      newsUpserted += 1;

      for (const slug of normalizeTextList(rawItem.relatedSlugs, 20, MAX_SLUG_LENGTH)) {
        await addStatement(
          db,
          statements,
          paramState,
          `INSERT OR IGNORE INTO news_movie_map (news_id, movie_id, match_method)
           SELECT n.id, m.id, ? FROM movie_news n, movies m
           WHERE n.guid=? AND m.slug=?`,
          [textOrNull(rawItem.matchMethod, MAX_SHORT_TEXT_LENGTH) ?? 'title_match', guid, slug],
        );
      }
    }

    for (const item of body.popularity ?? []) {
      if (!item) continue;
      const rawItem = item as Record<string, unknown>;
      const slug = textOrNull(rawItem.slug, MAX_SLUG_LENGTH);
      const source = textOrNull(rawItem.source, MAX_SOURCE_LENGTH);
      const metric = textOrNull(rawItem.metric, MAX_SHORT_TEXT_LENGTH);
      const value = numberOrNull(rawItem.value);
      const snapshotDate = textOrNull(rawItem.snapshotDate, MAX_SHORT_TEXT_LENGTH);
      if (!slug || !source || !metric || !VALID_POPULARITY_METRICS.has(metric) || value == null || !isDateOnly(snapshotDate)) {
        continue;
      }

      await addStatement(
        db,
        statements,
        paramState,
        `INSERT INTO popularity_snapshots (movie_id, source, metric, value, snapshot_date)
         SELECT id, ?, ?, ?, ? FROM movies WHERE slug=?
         ON CONFLICT(movie_id, source, metric, snapshot_date) DO UPDATE SET value=excluded.value`,
        [source, metric, value, snapshotDate, slug],
      );
      popularityUpserted += 1;
    }

    const itemsSeen = (body.movies?.length ?? 0) + (body.news?.length ?? 0) + (body.popularity?.length ?? 0);
    const itemsUpserted = moviesUpserted + newsUpserted + popularityUpserted;
    const status = itemsSeen === 0 ? 'zero_rows' : 'ok';

    await addStatement(
      db,
      statements,
      paramState,
      `INSERT INTO ingest_runs (
        run_date, source, status, items_seen, items_upserted, message, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))`,
      [
        body.runDate,
        body.source,
        status,
        itemsSeen,
        itemsUpserted,
        status === 'zero_rows' ? 'Source returned zero rows' : null,
        startedAt,
      ],
    );

    await flushBatch(db, statements, true);

    return NextResponse.json({
      ok: true,
      upserted: {
        movies: moviesUpserted,
        news: newsUpserted,
        popularity: popularityUpserted,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Internal Server Error', 500);
  }
}
