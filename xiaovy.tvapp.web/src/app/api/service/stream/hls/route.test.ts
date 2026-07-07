import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('GET /api/service/stream/hls', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a proxied m3u8 with CORS headers and rewritten URLs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\nchild.m3u8\nhttps://variants.streaks.jp/video/segment.ts\n',
        {
        status: 200,
        headers: { 'content-type': 'application/vnd.apple.mpegurl' },
        },
      ),
    );
    const sourceUrl = 'https://manifest.streaks.jp/path/master.m3u8?token=abc';
    const request = new NextRequest(`http://localhost/api/service/stream/hls?url=${encodeURIComponent(sourceUrl)}`);

    const response = await GET(request);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('content-type')).toBe('application/vnd.apple.mpegurl');
    expect(body).toContain(
      '/api/service/stream/hls?url=https%3A%2F%2Fmanifest.streaks.jp%2Fpath%2Fchild.m3u8',
    );
    expect(body).toContain('https://variants.streaks.jp/video/segment.ts');
    expect(body).not.toContain(
      '/api/service/stream/hls?url=https%3A%2F%2Fvariants.streaks.jp%2Fvideo%2Fsegment.ts',
    );
    expect(fetchMock).toHaveBeenCalledWith(sourceUrl, expect.objectContaining({ method: 'GET' }));
  });

  it('forwards range requests and streams binary responses', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 206,
        headers: {
          'accept-ranges': 'bytes',
          'content-range': 'bytes 0-2/3',
          'content-type': 'video/mp2t',
        },
      }),
    );
    const sourceUrl = 'https://variants.streaks.jp/video/segment.ts';
    const request = new NextRequest(`http://localhost/api/service/stream/hls?url=${encodeURIComponent(sourceUrl)}`, {
      headers: { range: 'bytes=0-2' },
    });

    const response = await GET(request);

    expect(response.status).toBe(206);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('accept-ranges')).toBe('bytes');
    expect(response.headers.get('content-range')).toBe('bytes 0-2/3');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(fetchMock).toHaveBeenCalledWith(
      sourceUrl,
      expect.objectContaining({ headers: expect.objectContaining({ get: expect.any(Function) }) }),
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Headers).get('range')).toBe('bytes=0-2');
  });

  it('rejects non-streaks URLs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const sourceUrl = 'https://example.test/master.m3u8';
    const request = new NextRequest(`http://localhost/api/service/stream/hls?url=${encodeURIComponent(sourceUrl)}`);

    const response = await GET(request);

    expect(response.status).toBe(403);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
