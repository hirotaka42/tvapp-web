import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStreaksInfoCached, resetStreaksInfoCache } from './streaksInfoCache';
import type { FetchFn, StreaksInfo } from './streamResolver';

const STREAKS_INFO: StreaksInfo = {
  'tver-ytv': {
    api_key: {
      key01: 'KEY-1',
      key02: 'KEY-2',
      key03: 'KEY-3',
      key04: 'KEY-4',
      key05: 'KEY-5',
      key06: 'KEY-6',
    },
  },
};

function mockFetch(info: StreaksInfo = STREAKS_INFO): FetchFn {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => info,
    text: async () => JSON.stringify(info),
  } as Response));
}

describe('getStreaksInfoCached', () => {
  beforeEach(() => {
    resetStreaksInfoCache();
  });

  it('TTL 内は初回取得した streaks_info を返す', async () => {
    const fetchFn = mockFetch();

    const first = await getStreaksInfoCached(fetchFn, 1_000);
    const second = await getStreaksInfoCached(fetchFn, 1_000 + 1_000);

    expect(first).toBe(second);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('TTL 経過後は再取得する', async () => {
    const fetchFn = mockFetch();

    await getStreaksInfoCached(fetchFn, 1_000);
    await getStreaksInfoCached(fetchFn, 1_000 + 6 * 3_600_000);

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('resetStreaksInfoCache でキャッシュを破棄する', async () => {
    const fetchFn = mockFetch();

    await getStreaksInfoCached(fetchFn, 1_000);
    resetStreaksInfoCache();
    await getStreaksInfoCached(fetchFn, 2_000);

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
