import { describe, expect, it } from 'vitest';
import { enrichNewsThumbnails } from '../src/newsThumbnails.mjs';

describe('enrichNewsThumbnails', () => {
  it('fetches og images only for the latest limited news items', async () => {
    const fetched = [];
    const rows = await enrichNewsThumbnails([
      {
        guid: 'old',
        source: 'eiga_com',
        title: '古いニュース',
        url: 'https://eiga.com/news/old/',
        publishedAt: '2026-07-01T00:00:00.000Z',
        thumbnailUrl: 'https://example.test/feed-logo.jpg',
      },
      {
        guid: 'new',
        source: 'natalie',
        title: '新しいニュース',
        url: 'https://natalie.mu/eiga/news/1',
        publishedAt: '2026-07-08T00:00:00.000Z',
        thumbnailUrl: null,
      },
    ], {
      limit: 1,
      fetchArticleText: async (url) => {
        fetched.push(url);
        return '<meta property="og:image" content="https://img.example.test/news.jpg">';
      },
    });

    expect(fetched).toEqual(['https://natalie.mu/eiga/news/1']);
    expect(rows).toEqual([
      expect.objectContaining({ guid: 'old', thumbnailUrl: 'https://example.test/feed-logo.jpg' }),
      expect.objectContaining({ guid: 'new', thumbnailUrl: 'https://img.example.test/news.jpg' }),
    ]);
  });

  it('turns failed latest thumbnail fetches into null without throwing', async () => {
    const rows = await enrichNewsThumbnails([
      {
        guid: 'new',
        source: 'realsound',
        title: 'ニュース',
        url: 'https://realsound.jp/movie/2026/07/post.html',
        publishedAt: '2026-07-08T00:00:00.000Z',
        thumbnailUrl: 'https://example.test/feed-logo.jpg',
      },
    ], {
      fetchArticleText: async () => {
        throw new Error('blocked');
      },
    });

    expect(rows[0].thumbnailUrl).toBeNull();
  });
});
