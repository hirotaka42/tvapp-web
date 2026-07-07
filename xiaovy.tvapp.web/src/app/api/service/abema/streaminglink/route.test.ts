import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadAzureRoute() {
  vi.resetModules();
  vi.stubEnv('AZURE_FUNCTION_STREEAMING', 'https://resolver.test');
  vi.stubEnv('AZURE_FUNCTION_STREEAMING_CODE_KEY', 'resolver-key');
  return import('./route');
}

function slotRequest() {
  return new NextRequest('http://localhost/api/service/abema/streaminglink?type=slot&slotId=210-18_s1_p1');
}

describe('GET /api/service/abema/streaminglink', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('keeps the successful Azure response shape', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
      video_url: 'https://manifest.abema.test/master.m3u8',
      subtitles: [],
    }), { status: 200 }));
    const { GET } = await loadAzureRoute();

    const response = await GET(slotRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      video_url: '/api/service/abema/hls?src=https%3A%2F%2Fmanifest.abema.test%2Fmaster.m3u8',
      m3u8_urls: ['https://manifest.abema.test/master.m3u8'],
      subtitles: [],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      name: 'premium',
      response: new Response('premium member only', { status: 403 }),
      expectedStatus: 403,
      expectedReason: 'premium',
    },
    {
      name: 'geo',
      response: new Response('ID124 region blocked', { status: 451 }),
      expectedStatus: 451,
      expectedReason: 'geo',
    },
    {
      name: 'not_found',
      response: new Response('missing', { status: 404 }),
      expectedStatus: 404,
      expectedReason: 'not_found',
    },
    {
      name: 'upstream',
      response: new Response('resolver error', { status: 502 }),
      expectedStatus: 502,
      expectedReason: 'upstream',
    },
  ])('classifies Azure $name failures', async ({ response, expectedStatus, expectedReason }) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
    const { GET } = await loadAzureRoute();

    const result = await GET(slotRequest());
    const body = await result.json();

    expect(result.status).toBe(expectedStatus);
    expect(body).toEqual({
      error: 'ABEMA stream resolve via Azure failed.',
      reason: expectedReason,
    });
  });

  it('classifies resolver connection failures as resolver_unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('connect ECONNREFUSED'));
    const { GET } = await loadAzureRoute();

    const response = await GET(slotRequest());
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      error: 'ABEMA stream resolve via Azure failed.',
      reason: 'resolver_unavailable',
    });
  });

  it('classifies empty Azure manifests using the response body text', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
      error: 'premium member only',
    }), { status: 200 }));
    const { GET } = await loadAzureRoute();

    const response = await GET(slotRequest());
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: 'Playable ABEMA manifest was not found.',
      reason: 'premium',
    });
  });

  it('classifies validation failures as unknown', async () => {
    vi.resetModules();
    const { GET } = await import('./route');

    const response = await GET(new NextRequest('http://localhost/api/service/abema/streaminglink?type=vod'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: 'type must be live or slot.',
      reason: 'unknown',
    });
  });
});
