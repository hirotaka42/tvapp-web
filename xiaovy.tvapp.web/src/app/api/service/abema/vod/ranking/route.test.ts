import { afterEach, describe, expect, it, vi } from 'vitest';
import { invalidateAbemaUserToken } from '@/lib/abema/auth';
import { GET } from './route';

describe('GET /api/service/abema/vod/ranking', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    invalidateAbemaUserToken();
  });

  it('fetches ranking modules with Authorization and cache headers without exposing token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'user-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        modules: [
          {
            id: 'ranking',
            nameFormat: '今日の総合ランキングTOP20',
            itemUiType: 'ITEM_UI_TYPE_RANKING',
            items: [
              {
                contentId: '210-18',
                contentType: 'CONTENT_TYPE_SERIES',
                title: '無職転生',
                label: { free: true },
              },
            ],
          },
        ],
      }), { status: 200 }));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('s-maxage=300, stale-while-revalidate=600');
    expect(body).toEqual({
      shelves: [
        {
          key: 'ranking',
          title: '今日の総合ランキングTOP20',
          uiType: 'ITEM_UI_TYPE_RANKING',
          items: [
            {
              contentId: '210-18',
              contentType: 'CONTENT_TYPE_SERIES',
              title: '無職転生',
              isFree: true,
              isPremium: false,
            },
          ],
        },
      ],
    });
    expect(JSON.stringify(body)).not.toContain('user-token');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.abema.io/v1/users');
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://user-content-api.p-c3-e.abema-tv.com/v1/modules?spotId=xRKNUGRQ&spotVersion=1&limit=8&qos=PC&qpl=web',
    );
    const rankingInit = fetchMock.mock.calls[1][1] as RequestInit;
    const rankingHeaders = rankingInit.headers as Headers;
    expect(rankingHeaders.get('Authorization')).toBe('bearer user-token');
    expect(rankingHeaders.get('Origin')).toBe('https://abema.tv');
    expect(rankingHeaders.get('Referer')).toBe('https://abema.tv/');
    expect(rankingHeaders.get('User-Agent')).toBe('Mozilla/5.0 TVapp ABEMA Browser');
  });

  it('refreshes the user token and retries once on upstream 401', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'expired-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'fresh-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ modules: [] }), { status: 200 }));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ shelves: [] });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect((fetchMock.mock.calls[1][1]?.headers as Headers).get('Authorization')).toBe('bearer expired-token');
    expect((fetchMock.mock.calls[3][1]?.headers as Headers).get('Authorization')).toBe('bearer fresh-token');
  });
});
