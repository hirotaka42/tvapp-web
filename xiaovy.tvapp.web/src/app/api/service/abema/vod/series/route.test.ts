import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { invalidateAbemaUserToken } from '@/lib/abema/auth';
import { GET } from './route';

describe('GET /api/service/abema/vod/series', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    invalidateAbemaUserToken();
  });

  it('fetches series and paged programs with Authorization and cache headers without exposing token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'user-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: '210-18',
        title: '追放された転生重騎士',
        content: 'シリーズ概要',
        version: 123,
        seasons: [{ id: '210-18_s1', sequence: 1, name: 'シーズン1' }],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        programs: [
          {
            id: '210-18_s1_p1',
            season: { id: '210-18_s1', name: 'シーズン1' },
            episode: { number: 1, title: '第1話' },
            label: { free: true },
          },
        ],
        version: 123,
      }), { status: 200 }));

    const response = await GET(new NextRequest('http://localhost/api/service/abema/vod/series?id=210-18'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('s-maxage=300, stale-while-revalidate=600');
    expect(body).toEqual({
      id: '210-18',
      title: '追放された転生重騎士',
      description: 'シリーズ概要',
      genreName: undefined,
      thumbnailUrl: undefined,
      seasons: [
        {
          id: '210-18_s1',
          name: 'シーズン1',
          sequence: 1,
          episodes: [
            {
              id: '210-18_s1_p1',
              number: 1,
              title: '第1話',
              isFree: true,
              isPremium: false,
              thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p1/thumb001.png?height=158&width=280&quality=75',
            },
          ],
        },
      ],
    });
    expect(JSON.stringify(body)).not.toContain('user-token');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.abema.io/v1/video/series/210-18');
    expect((fetchMock.mock.calls[1][1]?.headers as Headers).get('Authorization')).toBe('bearer user-token');

    const programsUrl = fetchMock.mock.calls[2][0] as URL;
    expect(programsUrl.toString()).toBe(
      'https://api.abema.io/v1/video/series/210-18/programs?seriesVersion=123&order=seq&seasonId=210-18_s1&limit=100&offset=0',
    );
    const programsHeaders = fetchMock.mock.calls[2][1]?.headers as Headers;
    expect(programsHeaders.get('Authorization')).toBe('bearer user-token');
    expect(programsHeaders.get('Origin')).toBe('https://abema.tv');
    expect(programsHeaders.get('Referer')).toBe('https://abema.tv/');
    expect(programsHeaders.get('User-Agent')).toBe('Mozilla/5.0 TVapp ABEMA Browser');
  });

  it('paginates programs until a short page', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: `210-18_s1_p${index + 1}`,
      season: { id: '210-18_s1', name: 'シーズン1' },
      episode: { number: index + 1, title: `第${index + 1}話` },
    }));

    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'user-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: '210-18',
        title: '追放された転生重騎士',
        version: 123,
        seasons: [{ id: '210-18_s1', name: 'シーズン1' }],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ programs: firstPage }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        programs: [{
          id: '210-18_s1_p101',
          season: { id: '210-18_s1', name: 'シーズン1' },
          episode: { number: 101, title: '第101話' },
        }],
      }), { status: 200 }));

    const response = await GET(new NextRequest('http://localhost/api/service/abema/vod/series?id=210-18'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.seasons[0].episodes).toHaveLength(101);
    expect((fetchMock.mock.calls[2][0] as URL).searchParams.get('offset')).toBe('0');
    expect((fetchMock.mock.calls[2][0] as URL).searchParams.get('seasonId')).toBe('210-18_s1');
    expect((fetchMock.mock.calls[3][0] as URL).searchParams.get('offset')).toBe('100');
    expect((fetchMock.mock.calls[3][0] as URL).searchParams.get('seasonId')).toBe('210-18_s1');
  });

  it('fetches programs for each full season id and preserves season order', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'user-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: '149-11',
        title: '無職転生',
        version: 456,
        seasons: [
          { id: '149-11_s1', name: '第1期', sequence: 1 },
          { id: '149-11_s2', name: '第2期', sequence: 2 },
          { id: '149-11_s3', name: '第3期', sequence: 3 },
        ],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        programs: [
          { id: '149-11_s1_p2', season: { id: '149-11_s1' }, episode: { number: 2, title: '第2話' } },
          { id: '149-11_s1_p1', season: { id: '149-11_s1' }, episode: { number: 1, title: '第1話' } },
        ],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        programs: [
          { id: '149-11_s2_p1', season: { id: '149-11_s2' }, episode: { number: 1, title: '第2期 第1話' } },
        ],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        programs: [
          { id: '149-11_s3_p1', season: { id: '149-11_s3' }, episode: { number: 1, title: '第3期 第1話' } },
        ],
      }), { status: 200 }));

    const response = await GET(new NextRequest('http://localhost/api/service/abema/vod/series?id=149-11'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.seasons.map((season: { id: string; episodes: unknown[] }) => ({
      id: season.id,
      episodeCount: season.episodes.length,
    }))).toEqual([
      { id: '149-11_s1', episodeCount: 2 },
      { id: '149-11_s2', episodeCount: 1 },
      { id: '149-11_s3', episodeCount: 1 },
    ]);
    expect(body.seasons[0].episodes.map((episode: { id: string }) => episode.id)).toEqual([
      '149-11_s1_p1',
      '149-11_s1_p2',
    ]);
    expect((fetchMock.mock.calls[2][0] as URL).searchParams.get('seasonId')).toBe('149-11_s1');
    expect((fetchMock.mock.calls[3][0] as URL).searchParams.get('seasonId')).toBe('149-11_s2');
    expect((fetchMock.mock.calls[4][0] as URL).searchParams.get('seasonId')).toBe('149-11_s3');
  });
});
