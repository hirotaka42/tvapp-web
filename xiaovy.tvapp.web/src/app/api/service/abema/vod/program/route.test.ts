import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { invalidateAbemaUserToken } from '@/lib/abema/auth';
import { GET } from './route';

describe('GET /api/service/abema/vod/program', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    invalidateAbemaUserToken();
  });

  it('fetches program metadata with Authorization and cache headers without exposing token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'user-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: '210-18_s1_p1',
        series: { id: '210-18', title: '追放された転生重騎士' },
        season: { id: '210-18_s1', name: 'シーズン1', sequence: 1 },
        episode: { number: 1, title: '第1話', content: 'あらすじ本文' },
        label: { free: true },
      }), { status: 200 }));

    const response = await GET(new NextRequest('http://localhost/api/service/abema/vod/program?id=210-18_s1_p1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('s-maxage=300, stale-while-revalidate=600');
    expect(body).toEqual({
      id: '210-18_s1_p1',
      seriesId: '210-18',
      seriesTitle: '追放された転生重騎士',
      seasonId: '210-18_s1',
      seasonName: 'シーズン1',
      seasonSequence: 1,
      episodeNumber: 1,
      episodeTitle: '第1話',
      description: 'あらすじ本文',
      thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p1/thumb001.png?height=158&width=280&quality=75',
      genreName: undefined,
      isFree: true,
      isPremium: false,
    });
    expect(JSON.stringify(body)).not.toContain('user-token');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.abema.io/v1/video/programs/210-18_s1_p1');
    const programHeaders = fetchMock.mock.calls[1][1]?.headers as Headers;
    expect(programHeaders.get('Authorization')).toBe('bearer user-token');
    expect(programHeaders.get('Origin')).toBe('https://abema.tv');
    expect(programHeaders.get('Referer')).toBe('https://abema.tv/');
    expect(programHeaders.get('User-Agent')).toBe('Mozilla/5.0 TVapp ABEMA Browser');
  });
});
