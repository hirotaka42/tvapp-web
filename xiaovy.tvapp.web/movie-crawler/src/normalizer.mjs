import { createHash } from 'node:crypto';
import { classifyNewsCategory, shouldKeepNewsItem } from './revenueFilter.mjs';
import { normalizeTitleForMatch, slugFromSource } from './identity.mjs';

function compactText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function uniqueStrings(values, limit = 20) {
  return [...new Set((values ?? []).map(compactText).filter(Boolean))].slice(0, limit);
}

function hashContent(value) {
  return createHash('sha1').update(JSON.stringify(value)).digest('hex');
}

// 純粋な映画ジャンルのみ許可する。ソースのカード文抽出はノイズ(地名・製作国・レーティング・レビュー点・
// 俳優名・あらすじ断片・「上映スケジュール」「配信中」等)が混ざるため、ホワイトリストで厳格に絞る。
const GENRE_ALIAS = {
  'アニメーション': 'アニメ', '劇場アニメ': 'アニメ', 'アニメ映画': 'アニメ',
  '人間ドラマ': 'ヒューマンドラマ', 'ドラマ': 'ヒューマンドラマ',
  'ラブストーリー': '恋愛', 'ラブロマンス': '恋愛', 'ロマンス': '恋愛', '恋愛ドラマ': '恋愛',
  'ファミリー': '家族', 'ホームドラマ': '家族', '家族劇': '家族',
  'キッズ': '子供向け', '児童向け': '子供向け',
  'ラブコメ': 'ラブコメディ', 'コメディー': 'コメディ',
  'ドキュメンタリー映画': 'ドキュメンタリー',
};
const GENRE_WHITELIST = new Set([
  'アクション', 'アドベンチャー', '冒険', 'SF', 'ファンタジー', 'ホラー', 'サイコホラー', 'サスペンス',
  'スリラー', 'ミステリー', 'アニメ', 'ヒューマンドラマ', '群像劇', '社会派', '恋愛', 'ラブコメディ',
  'コメディ', 'ブラックコメディ', '青春', '学園', '音楽', 'ミュージカル', 'ドキュメンタリー', '戦争',
  '西部劇', 'スポーツ', '時代劇', '歴史', '伝記', 'クライム', '犯罪', 'パニック', 'ディザスター',
  '家族', '子供向け', '医療', '法廷', '政治', 'オカルト', 'スプラッター', 'カルト', '特撮', 'ヒーロー',
  'ダンス', 'グルメ', '動物', '短編', '実験映画', 'ノワール', '不条理',
]);

export function normalizeGenres(raw) {
  const out = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const s = String(item ?? '').replace(/[・\s]/g, '').trim();
    if (!s) continue;
    const canon = GENRE_ALIAS[s] ?? s;
    if (GENRE_WHITELIST.has(canon) && !out.includes(canon)) out.push(canon);
  }
  return out.slice(0, 4);
}

export function normalizeMovie(raw) {
  const titleJa = compactText(raw.titleJa ?? raw.title);
  if (!titleJa) return null;

  const source = raw.source ?? 'crawler';
  const sourceKey = raw.sourceKey ?? null;
  const releaseDate = raw.releaseDate ?? null;
  const movie = {
    slug: raw.slug ?? slugFromSource({ source, sourceKey, titleJa, releaseDate }),
    titleJa,
    titleOriginal: compactText(raw.titleOriginal) || null,
    overview: compactText(raw.overview) || null,
    runtimeMin: Number.isFinite(raw.runtimeMin) ? raw.runtimeMin : null,
    rating: raw.rating ?? null,
    genres: normalizeGenres(raw.genres),
    screeningFormats: uniqueStrings(raw.screeningFormats),
    releaseDate,
    datePrecision: raw.datePrecision ?? (releaseDate ? 'day' : 'unknown'),
    isPostponed: Boolean(raw.isPostponed),
    releaseScale: raw.releaseScale ?? null,
    theaterCount: Number.isFinite(raw.theaterCount) ? raw.theaterCount : null,
    nowShowing: Boolean(raw.nowShowing),
    screeningEndDate: raw.screeningEndDate ?? null,
    isStreamingOnly: Boolean(raw.isStreamingOnly),
    posterUrl: raw.posterUrl ?? null,
    keyvisualUrl: raw.keyvisualUrl ?? null,
    source,
    sourceKey,
    sourceUrl: raw.sourceUrl ?? null,
    directors: uniqueStrings(raw.directors ?? (raw.director ? [raw.director] : []), 5),
    cast: uniqueStrings(raw.cast, 12),
  };
  movie.contentHash = hashContent(movie);
  return movie;
}

export function mergeMovies(rawMovies) {
  const bySlug = new Map();
  const normalized = rawMovies.map(normalizeMovie).filter(Boolean);

  for (const movie of normalized) {
    const titleKey = normalizeTitleForMatch(movie.titleJa);
    const existing = [...bySlug.values()].find((item) => (
      movie.sourceKey && item.sourceKey === movie.sourceKey
    )) ?? bySlug.get(movie.slug) ?? [...bySlug.values()].find((item) => {
      if (normalizeTitleForMatch(item.titleJa) !== titleKey) return false;
      if (!item.releaseDate || !movie.releaseDate) return true;
      return Math.abs(Date.parse(item.releaseDate) - Date.parse(movie.releaseDate)) <= 1000 * 60 * 60 * 24 * 45;
    });

    if (!existing) {
      bySlug.set(movie.slug, movie);
      continue;
    }

    bySlug.set(existing.slug, mergeMovieRows(existing, movie));
  }

  return [...bySlug.values()].map((movie) => ({
    ...movie,
    contentHash: hashContent(movie),
  }));
}

function mergeMovieRows(existing, movie) {
  return {
    ...existing,
    titleOriginal: existing.titleOriginal ?? movie.titleOriginal,
    overview: existing.overview ?? movie.overview,
    runtimeMin: existing.runtimeMin ?? movie.runtimeMin,
    rating: existing.rating ?? movie.rating,
    genres: normalizeGenres([...existing.genres, ...movie.genres]),
    screeningFormats: uniqueStrings([...existing.screeningFormats, ...movie.screeningFormats]),
    releaseDate: existing.releaseDate ?? movie.releaseDate,
    datePrecision: betterDatePrecision(existing.datePrecision, movie.datePrecision),
    isPostponed: existing.isPostponed || movie.isPostponed,
    releaseScale: existing.releaseScale ?? movie.releaseScale,
    theaterCount: existing.theaterCount ?? movie.theaterCount,
    nowShowing: existing.nowShowing || movie.nowShowing,
    screeningEndDate: existing.screeningEndDate ?? movie.screeningEndDate,
    isStreamingOnly: existing.isStreamingOnly || movie.isStreamingOnly,
    posterUrl: existing.posterUrl ?? movie.posterUrl,
    keyvisualUrl: existing.keyvisualUrl ?? movie.keyvisualUrl,
    sourceUrl: existing.sourceUrl ?? movie.sourceUrl,
    directors: uniqueStrings([...existing.directors, ...movie.directors], 5),
    cast: uniqueStrings([...existing.cast, ...movie.cast], 12),
  };
}

function betterDatePrecision(existing, incoming) {
  const rank = { unknown: 0, year: 1, month: 2, day: 3 };
  return (rank[incoming] ?? 0) > (rank[existing] ?? 0) ? incoming : existing;
}

export function normalizeNews(rawItems, movies = []) {
  return rawItems
    .filter(shouldKeepNewsItem)
    .map((item) => {
      const text = `${item.title ?? ''}\n${item.summary ?? ''}`;
      const normalizedText = normalizeTitleForMatch(text);
      const relatedSlugs = movies
        .filter((movie) => {
          const normalizedTitle = normalizeTitleForMatch(movie.titleJa);
          return text.includes(`『${movie.titleJa}』`)
            || text.includes(`「${movie.titleJa}」`)
            || (normalizedTitle.length >= 2 && normalizedText.includes(normalizedTitle));
        })
        .map((movie) => movie.slug);

      return {
        guid: item.guid || item.url,
        source: item.source,
        title: compactText(item.title),
        url: item.url,
        summary: compactText(item.summary) || null,
        publishedAt: item.publishedAt,
        category: classifyNewsCategory(text),
        thumbnailUrl: item.thumbnailUrl ?? null,
        relatedSlugs,
        matchMethod: relatedSlugs.length > 0 ? 'title_match' : null,
      };
    })
    .filter((item) => item.guid && item.source && item.title && item.url && item.publishedAt);
}

export function normalizePopularity(rawItems, movies, snapshotDate) {
  return rawItems
    .map((item) => {
      const normalizedTitle = normalizeTitleForMatch(item.titleJa ?? item.title);
      const movie = movies.find((candidate) => normalizeTitleForMatch(candidate.titleJa) === normalizedTitle);
      if (!movie) return null;
      return {
        slug: movie.slug,
        source: item.source,
        metric: item.metric,
        value: Number(item.value),
        snapshotDate: item.snapshotDate ?? snapshotDate,
      };
    })
    .filter((item) => item && Number.isFinite(item.value));
}
