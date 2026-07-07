import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithAbemaUserToken,
  generateAbemaApplicationKeySecret,
  getAbemaUserToken,
  invalidateAbemaUserToken,
} from './auth';

describe('generateAbemaApplicationKeySecret', () => {
  afterEach(() => {
    invalidateAbemaUserToken();
  });

  it('is deterministic for the same device id and injected time', async () => {
    const deviceId = '00000000-0000-4000-8000-000000000000';
    const now = new Date('2026-07-07T01:23:45.000Z');

    const left = await generateAbemaApplicationKeySecret(deviceId, now);
    const right = await generateAbemaApplicationKeySecret(deviceId, now);

    expect(left).toBe(right);
    expect(left).toHaveLength(43);
    expect(left).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(left).not.toContain('=');
  });

  it('caches the fetched token until invalidated', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ token: 'token-1' }), { status: 200 }),
    );

    const first = await getAbemaUserToken({ fetcher, now: new Date('2026-07-07T00:00:00.000Z') });
    const second = await getAbemaUserToken({ fetcher, now: new Date('2026-07-07T00:00:01.000Z') });

    expect(first.userToken).toBe('token-1');
    expect(second).toBe(first);
    expect(fetcher).toHaveBeenCalledTimes(1);

    invalidateAbemaUserToken();
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ token: 'token-2' }), { status: 200 }));
    const refreshed = await getAbemaUserToken({ fetcher, now: new Date('2026-07-07T00:00:02.000Z') });

    expect(refreshed.userToken).toBe('token-2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidates and retries once on upstream 401', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'token-1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'token-2' }), { status: 200 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const response = await fetchWithAbemaUserToken('https://example.test/data', {}, { fetcher });

    expect(response.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect((fetcher.mock.calls[1][1]?.headers as Headers).get('Authorization')).toBe('bearer token-1');
    expect((fetcher.mock.calls[3][1]?.headers as Headers).get('Authorization')).toBe('bearer token-2');
  });
});
