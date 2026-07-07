import { describe, expect, it } from 'vitest';
import { mergeMovies, normalizeMovie, normalizeNews, normalizePopularity } from '../src/normalizer.mjs';

describe('normalizer', () => {
  it('maps raw movie rows to ingest movie shape', () => {
    const movie = normalizeMovie({
      source: 'eiga_com',
      sourceKey: 'eiga.com_123456',
      sourceUrl: 'https://eiga.com/movie/123456/',
      titleJa: 'サンプル映画',
      releaseDate: '2026-07-18',
      genres: ['ドラマ', 'ドラマ', ' '],
      directors: ['山田太郎'],
      cast: ['佐藤花子', '佐藤花子'],
      nowShowing: true,
    });

    expect(movie).toMatchObject({
      slug: 'eiga-com-123456',
      titleJa: 'サンプル映画',
      releaseDate: '2026-07-18',
      datePrecision: 'day',
      source: 'eiga_com',
      sourceKey: 'eiga.com_123456',
      nowShowing: true,
      genres: ['ドラマ'],
      directors: ['山田太郎'],
      cast: ['佐藤花子'],
    });
    expect(movie.contentHash).toHaveLength(40);
  });

  it('merges duplicate titles with nearby release dates and normalizes related news/popularity', () => {
    const movies = mergeMovies([
      {
        source: 'eiga_com',
        sourceKey: 'eiga.com_123456',
        titleJa: '『サンプル映画』',
        releaseDate: '2026-07-18',
        nowShowing: false,
      },
      {
        source: 'moviewalker',
        sourceKey: 'moviewalker_777',
        titleJa: 'サンプル映画',
        releaseDate: '2026-07-20',
        nowShowing: true,
        runtimeMin: 110,
      },
    ]);

    expect(movies).toHaveLength(1);
    expect(movies[0]).toMatchObject({ nowShowing: true, runtimeMin: 110 });

    const news = normalizeNews([
      {
        source: 'eiga_com',
        guid: 'news-1',
        title: '映画「サンプル映画」公開日決定',
        url: 'https://example.test/news-1',
        publishedAt: '2026-07-01T00:00:00.000Z',
      },
    ], movies);
    expect(news[0]).toMatchObject({
      category: 'release_date',
      relatedSlugs: [movies[0].slug],
      matchMethod: 'title_match',
    });

    const popularity = normalizePopularity([
      { source: 'filmarks', titleJa: 'サンプル映画', metric: 'want_to_watch', value: 1234 },
    ], movies, '2026-07-08');
    expect(popularity).toEqual([
      {
        slug: movies[0].slug,
        source: 'filmarks',
        metric: 'want_to_watch',
        value: 1234,
        snapshotDate: '2026-07-08',
      },
    ]);
  });
});
