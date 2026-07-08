import { describe, expect, it } from 'vitest';
import {
  parseMovieWalkerDetail,
  parseMovieWalkerList,
  parseOpenGraphImage,
} from '../src/htmlParsers.mjs';

describe('htmlParsers', () => {
  it('extracts Movie Walker list metadata from card text', () => {
    const rows = parseMovieWalkerList(`
      <article>
        <a href="/movies/12345/" title="サンプル映画">
          <img src="https://cdn.example.test/poster.jpg">
          サンプル映画
        </a>
        <p>2026年7月18日公開、130分、アニメ</p>
      </article>
    `, 'https://press.moviewalker.jp/list/coming/');

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      source: 'moviewalker',
      sourceKey: 'moviewalker_12345',
      sourceUrl: 'https://press.moviewalker.jp/movies/12345/',
      titleJa: 'サンプル映画',
      releaseDate: '2026-07-18',
      runtimeMin: 130,
      genres: ['アニメ'],
      posterUrl: 'https://cdn.example.test/poster.jpg',
      nowShowing: false,
    });
  });

  it('extracts Movie Walker detail JSON-LD including genre', () => {
    const row = parseMovieWalkerDetail(`
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Movie",
          "name": "詳細映画",
          "duration": "PT1H44M",
          "genre": ["ホラー", "スリラー"],
          "director": [{"name": "監督太郎"}],
          "actor": [{"name": "俳優花子"}],
          "image": "https://cdn.example.test/detail.jpg",
          "datePublished": "2026-08-01"
        }
      </script>
    `, 'https://press.moviewalker.jp/mv67890/');

    expect(row).toMatchObject({
      sourceKey: 'moviewalker_67890',
      titleJa: '詳細映画',
      runtimeMin: 104,
      genres: ['ホラー', 'スリラー'],
      directors: ['監督太郎'],
      cast: ['俳優花子'],
      posterUrl: 'https://cdn.example.test/detail.jpg',
      releaseDate: '2026-08-01',
    });
  });

  it('sanitizes og image URLs from news article HTML', () => {
    expect(parseOpenGraphImage(`
      <meta property="og:image" content="/assets/news.jpg">
    `, 'https://natalie.mu/eiga/news/123')).toBe('https://natalie.mu/assets/news.jpg');

    expect(parseOpenGraphImage(`
      <meta name="twitter:image" content="javascript:alert(1)">
    `, 'https://natalie.mu/eiga/news/123')).toBeNull();
  });
});
