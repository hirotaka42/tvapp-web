import { fetchText } from './fetcher.mjs';
import { parseFeed } from './feedParser.mjs';
import {
  parseEigaComing,
  parseEigaNow,
  parseFilmarksList,
  parseMovieWalkerDetail,
  parseMovieWalkerList,
} from './htmlParsers.mjs';
import { parseComingIcs } from './icsParser.mjs';
import { enrichNewsThumbnails } from './newsThumbnails.mjs';
import { mergeMovies, normalizeNews, normalizePopularity } from './normalizer.mjs';

function jstDate(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function comingMonthPaths(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
  });
  const [year, month] = formatter.format(date).split('-').map(Number);
  return [0, 1, 2].map((offset) => {
    const target = new Date(Date.UTC(year, month - 1 + offset, 1));
    return `${target.getUTCFullYear()}${String(target.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

async function collectSource(name, fn) {
  try {
    const rows = await fn();
    return { name, rows, status: rows.length === 0 ? 'zero_rows' : 'ok' };
  } catch (error) {
    return {
      name,
      rows: [],
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function crawlAll({ limit = null, now = new Date() } = {}) {
  const runDate = jstDate(now);
  const sourceResults = [];
  const rawMovies = [];
  const rawNews = [];
  const rawPopularity = [];

  sourceResults.push(await collectSource('eiga_com_ics', async () => parseComingIcs(
    await fetchText('https://eiga.com/movie/coming.ics'),
  )));
  rawMovies.push(...sourceResults.at(-1).rows);

  sourceResults.push(await collectSource('eiga_com_now', async () => {
    const rows = [];
    const pageLimit = limit ? Math.max(1, Math.ceil(limit / 20)) : 4;
    for (let page = 1; page <= pageLimit; page += 1) {
      const url = page === 1 ? 'https://eiga.com/now/' : `https://eiga.com/now/${page}/`;
      rows.push(...parseEigaNow(await fetchText(url), url));
      if (limit && rows.length >= limit) break;
    }
    return rows;
  }));
  rawMovies.push(...sourceResults.at(-1).rows);

  sourceResults.push(await collectSource('eiga_com_coming', async () => {
    const rows = [];
    // 月別タブ /coming/YYYYMM/ は 410(廃止)。現行は /coming/(公開予定一覧・ポスター付)と
    // /coming/999999/(公開日未定・年のみ精度)。iCal はポスターを持たないため /coming/ で補完する。
    const comingUrl = 'https://eiga.com/coming/';
    rows.push(...parseEigaComing(await fetchText(comingUrl), comingUrl, 'month'));
    const undatedUrl = 'https://eiga.com/coming/999999/';
    rows.push(...parseEigaComing(await fetchText(undatedUrl), undatedUrl, 'year'));
    return rows;
  }));
  rawMovies.push(...sourceResults.at(-1).rows);

  sourceResults.push(await collectSource('moviewalker', async () => {
    const listRows = [];
    for (const listUrl of ['https://press.moviewalker.jp/list/', 'https://press.moviewalker.jp/list/coming/']) {
      listRows.push(...parseMovieWalkerList(await fetchText(listUrl), listUrl));
    }
    const links = listRows.slice(0, limit ?? 30);
    const rows = [];
    for (const link of links) {
      const detail = parseMovieWalkerDetail(await fetchText(link.url), link.url);
      rows.push(mergeMovieWalkerRows(link, detail));
    }
    if (!limit) rows.push(...listRows.slice(links.length));
    return rows;
  }));
  rawMovies.push(...sourceResults.at(-1).rows);

  sourceResults.push(await collectSource('filmarks', async () => {
    const urls = ['https://filmarks.com/list/now', 'https://filmarks.com/list/coming'];
    const rows = [];
    for (const url of urls) rows.push(...parseFilmarksList(await fetchText(url), url));
    return rows;
  }));
  rawPopularity.push(...sourceResults.at(-1).rows);

  // limit は各ソースの取得深さ(ページ数/詳細件数)を絞る用途に留め、結合後の全体スライスはしない。
  // 全体スライスすると先頭を埋める公開予定(iCal)で埋まり、後段の「今上映中」(/now/)が落ちるため。
  const movies = mergeMovies(rawMovies);

  for (const feed of [
    { source: 'natalie', url: 'https://natalie.mu/eiga/feed/news' },
    { source: 'eiga_com', url: 'https://feeds.eiga.com/eiga_news.xml' },
    { source: 'realsound', url: 'https://realsound.jp/movie/feed' },
  ]) {
    sourceResults.push(await collectSource(feed.source, async () => parseFeed(await fetchText(feed.url), feed.source)));
    rawNews.push(...sourceResults.at(-1).rows);
  }

  const news = await enrichNewsThumbnails(
    normalizeNews(limit ? rawNews.slice(0, limit) : rawNews, movies),
    { limit: 30 },
  );
  const popularity = normalizePopularity(limit ? rawPopularity.slice(0, limit) : rawPopularity, movies, runDate);

  return {
    runDate,
    source: 'movie_crawler',
    movies,
    news,
    popularity,
    sourceResults,
  };
}

function mergeMovieWalkerRows(listRow, detail) {
  if (!detail) return listRow;
  return {
    ...listRow,
    ...detail,
    runtimeMin: detail.runtimeMin ?? listRow.runtimeMin,
    genres: [...(listRow.genres ?? []), ...(detail.genres ?? [])],
    posterUrl: detail.posterUrl ?? listRow.posterUrl,
    nowShowing: Boolean(listRow.nowShowing || detail.nowShowing),
  };
}
