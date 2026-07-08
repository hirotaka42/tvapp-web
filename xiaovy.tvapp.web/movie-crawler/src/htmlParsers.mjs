import * as cheerio from 'cheerio';

function textOf($, element) {
  return $(element).text().replace(/\s+/g, ' ').trim();
}

function absoluteUrl(url, baseUrl) {
  if (!url) return null;
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return null;
  }
}

function dateFromJapaneseText(text) {
  const match = text.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

function monthFromJapaneseText(text) {
  const match = text.match(/(\d{4})年\s*(\d{1,2})月/);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, '0')}-01`;
}

function yearFromJapaneseText(text) {
  const match = text.match(/(20\d{2})年/);
  return match ? `${match[1]}-01-01` : null;
}

function sourceKeyFromHref(href, prefix) {
  const match = String(href ?? '').match(/\/movie\/(\d+)/)
    ?? String(href ?? '').match(/\/movies\/(\d+)/)
    ?? String(href ?? '').match(/\/mv(\d+)\/?/);
  return match ? `${prefix}_${match[1]}` : null;
}

export function parseEigaNow(html, pageUrl = 'https://eiga.com/now/') {
  const $ = cheerio.load(html);
  const movies = [];
  const seen = new Set();

  $('[id^="mv"], .m_unit, .movieList li, .item').each((_, element) => {
    const id = $(element).attr('id');
    const link = $(element).find('a[href*="/movie/"]').first();
    const href = link.attr('href');
    const sourceKey = id?.match(/^mv(\d+)/) ? `eiga.com_${id.replace(/^mv/, '')}` : sourceKeyFromHref(href, 'eiga.com');
    const title = $(element).find('h3, h2, .title, .name').first().text().trim() || link.attr('title') || textOf($, link);
    if (!sourceKey || !title || seen.has(sourceKey)) return;
    seen.add(sourceKey);

    const fullText = textOf($, element);
    const image = $(element).find('img').first();
    // 映画.com /now/ /coming/ のカードは <ul class="cast-staff"><li><span>名前</span> 監督</li>
    // <li><span>...</span>, <span>...</span></li></ul>。監督を含む li は監督、それ以外はキャスト。
    const directors = [];
    const cast = [];
    $(element).find('ul.cast-staff li').each((_, li) => {
      const names = $(li).find('span').map((__, s) => $(s).text().trim()).get().filter(Boolean);
      if (/監督/.test($(li).text())) directors.push(...names);
      else cast.push(...names);
    });
    movies.push({
      source: 'eiga_com',
      sourceKey,
      sourceUrl: absoluteUrl(href, pageUrl),
      titleJa: title,
      releaseDate: dateFromJapaneseText(fullText),
      datePrecision: dateFromJapaneseText(fullText) ? 'day' : 'unknown',
      posterUrl: absoluteUrl(image.attr('src') || image.attr('data-src'), pageUrl),
      nowShowing: true,
      directors: directors.length ? directors.slice(0, 2) : extractNames(fullText, /監督[:：]\s*([^出演キャスト]+)/),
      cast: (cast.length ? cast : extractNames(fullText, /(?:出演|キャスト)[:：]\s*(.+)$/)).slice(0, 8),
    });
  });

  return movies;
}

export function parseEigaComing(html, pageUrl, fallbackPrecision = 'month') {
  const $ = cheerio.load(html);
  const movies = [];
  const seen = new Set();

  $('a[href*="/movie/"]').each((_, link) => {
    const href = $(link).attr('href');
    const sourceKey = sourceKeyFromHref(href, 'eiga.com');
    if (!sourceKey || seen.has(sourceKey)) return;
    const container = $(link).closest('li, article, .m_unit, .item, tr, div');
    const title = $(link).attr('title') || textOf($, link);
    if (!title || title.length > 80) return;
    seen.add(sourceKey);

    const fullText = textOf($, container.length ? container : link);
    const day = dateFromJapaneseText(fullText);
    const month = monthFromJapaneseText(fullText);
    const year = yearFromJapaneseText(fullText);
    const releaseDate = day ?? month ?? year;
    const image = container.find('img').first();
    movies.push({
      source: 'eiga_com',
      sourceKey,
      sourceUrl: absoluteUrl(href, pageUrl),
      titleJa: title,
      releaseDate,
      datePrecision: day ? 'day' : month ? 'month' : year ? 'year' : fallbackPrecision,
      posterUrl: absoluteUrl(image.attr('src') || image.attr('data-src'), pageUrl),
      isPostponed: /延期/.test(fullText),
      isStreamingOnly: /配信/.test(fullText),
    });
  });

  return movies;
}

export function parseMovieWalkerList(html, pageUrl = 'https://press.moviewalker.jp/list/coming/') {
  const $ = cheerio.load(html);
  const links = [];
  const seen = new Set();

  $('a[href*="/movies/"], a[href*="/mv"]').each((_, link) => {
    const href = absoluteUrl($(link).attr('href'), pageUrl);
    const sourceKey = sourceKeyFromHref(href, 'moviewalker');
    if (!href || !sourceKey || seen.has(sourceKey)) return;
    seen.add(sourceKey);
    const container = $(link).closest('li, article, .m_unit, .item, .card, .p-movie, .movie');
    const scope = container.length ? container : $(link).parent();
    const fullText = textOf($, scope.length ? scope : link);
    const title = $(link).attr('title')
      || $(scope).find('h2, h3, .title, .name').first().text().trim()
      || textOf($, link);
    const image = $(scope).find('img').first();
    const { runtimeMin, genres } = extractMovieWalkerRuntimeAndGenres(fullText);
    links.push({
      url: href,
      sourceKey,
      source: 'moviewalker',
      sourceUrl: href,
      titleJa: title,
      runtimeMin,
      genres,
      releaseDate: dateFromJapaneseText(fullText),
      datePrecision: dateFromJapaneseText(fullText) ? 'day' : 'unknown',
      posterUrl: absoluteUrl(image.attr('src') || image.attr('data-src'), pageUrl),
      nowShowing: pageUrl.includes('/list/') && !pageUrl.includes('/coming/'),
    });
  });

  return links;
}

export function parseMovieWalkerDetail(html, pageUrl) {
  const $ = cheerio.load(html);
  const sourceKey = sourceKeyFromHref(pageUrl, 'moviewalker');
  const jsonNodes = $('script[type="application/ld+json"]')
    .map((_, element) => $(element).contents().text())
    .get();

  for (const node of jsonNodes) {
    try {
      const movie = findSchemaMovie(JSON.parse(node));
      if (!movie || movie['@type'] !== 'Movie') continue;
      return {
        source: 'moviewalker',
        sourceKey,
        sourceUrl: pageUrl,
        titleJa: movie.name,
        runtimeMin: durationToMinutes(movie.duration),
        genres: normalizeSchemaGenres(movie.genre),
        directors: normalizeSchemaPeople(movie.director),
        cast: normalizeSchemaPeople(movie.actor),
        posterUrl: Array.isArray(movie.image) ? movie.image[0] : movie.image,
        releaseDate: typeof movie.datePublished === 'string' ? movie.datePublished.slice(0, 10) : null,
        datePrecision: typeof movie.datePublished === 'string' ? 'day' : 'unknown',
      };
    } catch {
      continue;
    }
  }

  return null;
}

export function parseOpenGraphImage(html, pageUrl) {
  const $ = cheerio.load(html);
  const value = $('meta[property="og:image"]').first().attr('content')
    || $('meta[name="twitter:image"]').first().attr('content')
    || $('meta[property="twitter:image"]').first().attr('content');
  return safeExternalUrl(absoluteUrl(value, pageUrl));
}

export function parseFilmarksList(html, sourceUrl) {
  const $ = cheerio.load(html);
  const rows = [];

  $('[data-mark], [data-clip], .p-movie-cassette, .js-cassette').each((_, element) => {
    const title = $(element).find('h3, h2, .p-content-cassette__title, .movie-title').first().text().trim()
      || $(element).find('a[href*="/movies/"]').first().text().trim();
    if (!title) return;

    const mark = parseJsonNumber($(element).attr('data-mark'));
    const clip = parseJsonNumber($(element).attr('data-clip'));
    const score = Number.parseFloat($(element).find('.c-rating__score, .rating__score').first().text().trim());

    if (Number.isFinite(clip)) {
      rows.push({ source: 'filmarks', titleJa: title, metric: 'want_to_watch', value: clip, sourceUrl });
    }
    if (Number.isFinite(mark)) {
      rows.push({ source: 'filmarks', titleJa: title, metric: 'watched', value: mark, sourceUrl });
    }
    if (Number.isFinite(score)) {
      rows.push({ source: 'filmarks', titleJa: title, metric: 'rating_avg', value: score, sourceUrl });
    }
  });

  return rows;
}

function parseJsonNumber(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'number') return parsed;
    if (typeof parsed?.count === 'number') return parsed.count;
    if (typeof parsed?.count === 'string') return Number.parseFloat(parsed.count.replace(/,/g, ''));
  } catch {
    const number = Number.parseFloat(String(value).replace(/,/g, ''));
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function normalizeSchemaPeople(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .map((item) => (typeof item === 'string' ? item : item?.name))
    .filter(Boolean);
}

function normalizeSchemaGenres(value) {
  const values = Array.isArray(value) ? value : value ? String(value).split(/[、,\s]+/) : [];
  return values
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function findSchemaMovie(value) {
  const values = Array.isArray(value) ? value : [value];
  for (const item of values) {
    if (item?.['@type'] === 'Movie') return item;
    const graph = Array.isArray(item?.['@graph']) ? item['@graph'] : [];
    const movie = graph.find((graphItem) => graphItem?.['@type'] === 'Movie');
    if (movie) return movie;
  }
  return null;
}

function durationToMinutes(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  return Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
}

function extractNames(text, pattern) {
  const match = text.match(pattern);
  if (!match) return [];
  return match[1]
    .split(/[、,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractMovieWalkerRuntimeAndGenres(text) {
  const match = String(text ?? '').match(/(\d{2,3})分[、,\s]+([^。／/|｜\n]+)/);
  if (!match) return { runtimeMin: null, genres: [] };
  const genres = match[2]
    .split(/[、,\s]+/)
    .map((item) => item.trim())
    .filter((item) => item && !/^\d{4}年|\d{1,2}月|\d{1,2}日|公開$/.test(item));
  return { runtimeMin: Number(match[1]), genres };
}

function safeExternalUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
