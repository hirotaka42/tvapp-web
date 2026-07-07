import { describe, it, expect } from 'vitest';
import {
  selectStreaksKeyIndex,
  streaksKeyName,
  createSession,
  getStreaksInfo,
  getEpisodeVersion,
  getStaticContent,
  resolveStreaksPlayback,
  resolveEpisodeStream,
  TverGeoRestrictedError,
  TverApiKeyError,
  TverStreamNotFoundError,
  TverUpstreamError,
  type FetchFn,
  type StreaksInfo,
} from './streamResolver';

// ---- テスト用の fetch モック --------------------------------------------

function mockResponse(body: unknown, init: { status?: number; ok?: boolean } = {}): Response {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

interface Route {
  match: string;
  respond: (url: string, init?: RequestInit) => Response;
}

function makeFetch(routes: Route[]) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push({ url, init });
    const route = routes.find((r) => url.includes(r.match));
    if (!route) throw new Error(`モック未定義の URL: ${url}`);
    return route.respond(url, init);
  }) as FetchFn;
  return { fn, calls };
}

// ---- フィクスチャ(実データ形状に準拠) ----------------------------------

const STREAKS_INFO: StreaksInfo = {
  'tver-ytv': {
    api_key: {
      key01: 'KEY-JAN-JUL',
      key02: 'KEY-FEB-AUG',
      key03: 'KEY-MAR-SEP',
      key04: 'KEY-APR-OCT',
      key05: 'KEY-MAY-NOV',
      key06: 'KEY-JUN-DEC',
    },
  },
};

const SESSION = { platformUid: 'uid-123', platformToken: 'tok-456' };

const STATIC_CONTENT = {
  id: 'ep1wxk911o',
  version: 12,
  video: { videoRefID: 'dearhusband-ytv-01-260702', accountID: '5330942432001', playerID: 'SLdAOA4uy' },
  streaks: { videoRefID: 'dearhusband-ytv-01-260702', mediaID: 'eb8e41...', projectID: 'tver-ytv' },
  title: '1話 死んでも愛してる',
  description: '説明',
  seriesID: 'sr599tnf8e',
};

const PLAYBACK_OK = {
  id: 'eb8e41c757ce4512b80fcdfaca37fe31',
  type: 'file',
  name: '親愛なる夫へ 1話',
  duration: 2597.061,
  sources: [
    { type: 'application/x-mpegURL', src: 'https://manifest.streaks.jp/v6/tver-ytv/aaa/hls/v3/manifest.m3u8?token=xxx' },
    { type: 'application/dash+xml', src: 'https://example/dash.mpd', key_systems: { 'com.widevine.alpha': {} } },
  ],
  tracks: [
    { kind: 'subtitles', srclang: 'ja', src: 'https://example/sub.vtt' },
    { kind: 'thumbnails', src: 'https://example/thumb.vtt' },
  ],
};

// ---- selectStreaksKeyIndex ------------------------------------------------

describe('selectStreaksKeyIndex', () => {
  // JST の月 → 期待スロット: (month % 6) || 6
  const cases: Array<[number, number]> = [
    [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6],
    [7, 1], [8, 2], [9, 3], [10, 4], [11, 5], [12, 6],
  ];
  it.each(cases)('JST %i月 → key0%i スロット', (month, expected) => {
    // UTC 15日 00:00 は JST 同月 09:00 なので月境界を跨がない
    const d = new Date(Date.UTC(2026, month - 1, 15, 0, 0, 0));
    expect(selectStreaksKeyIndex(d)).toBe(expected);
  });

  it('JST 月境界(UTC 6/30 20:00 = JST 7/1 05:00)は 7月として扱う', () => {
    const d = new Date(Date.UTC(2026, 5, 30, 20, 0, 0));
    expect(selectStreaksKeyIndex(d)).toBe(1); // 7月 → key01
  });

  it('streaksKeyName は key0N 形式', () => {
    expect(streaksKeyName(1)).toBe('key01');
    expect(streaksKeyName(6)).toBe('key06');
  });
});

// ---- createSession --------------------------------------------------------

describe('createSession', () => {
  it('platform_uid/platform_token を返す', async () => {
    const { fn } = makeFetch([
      { match: 'platform_users/browser/create', respond: () => mockResponse({ result: { platform_uid: 'u', platform_token: 't' } }) },
    ]);
    await expect(createSession(fn)).resolves.toEqual({ platformUid: 'u', platformToken: 't' });
  });

  it('非OKなら TverUpstreamError', async () => {
    const { fn } = makeFetch([
      { match: 'browser/create', respond: () => mockResponse({}, { status: 503 }) },
    ]);
    await expect(createSession(fn)).rejects.toBeInstanceOf(TverUpstreamError);
  });

  it('result 欠落なら 502 相当のエラー', async () => {
    const { fn } = makeFetch([
      { match: 'browser/create', respond: () => mockResponse({ result: {} }) },
    ]);
    await expect(createSession(fn)).rejects.toBeInstanceOf(TverUpstreamError);
  });
});

// ---- getStreaksInfo / getEpisodeVersion / getStaticContent ----------------

describe('getStreaksInfo', () => {
  it('プロジェクト別キー表を返す', async () => {
    const { fn } = makeFetch([
      { match: 'streaks_info_v2.json', respond: () => mockResponse(STREAKS_INFO) },
    ]);
    const info = await getStreaksInfo(fn);
    expect(info['tver-ytv'].api_key?.key01).toBe('KEY-JAN-JUL');
  });
});

describe('getEpisodeVersion', () => {
  it('callEpisode の version を文字列で返す', async () => {
    const { fn } = makeFetch([
      { match: 'callEpisode', respond: () => mockResponse({ result: { episode: { content: { version: 12 } } } }) },
    ]);
    await expect(getEpisodeVersion('ep1', SESSION, fn)).resolves.toBe('12');
  });

  it('非OKなら既定値 "5" にフォールバック', async () => {
    const { fn } = makeFetch([
      { match: 'callEpisode', respond: () => mockResponse({}, { status: 500 }) },
    ]);
    await expect(getEpisodeVersion('ep1', SESSION, fn)).resolves.toBe('5');
  });

  it('セッション値をクエリに載せる', async () => {
    const { fn, calls } = makeFetch([
      { match: 'callEpisode', respond: () => mockResponse({ result: { episode: { content: { version: 3 } } } }) },
    ]);
    await getEpisodeVersion('epABC', SESSION, fn);
    expect(calls[0].url).toContain('platform_uid=uid-123');
    expect(calls[0].url).toContain('platform_token=tok-456');
    expect(calls[0].url).toContain('callEpisode/epABC');
  });
});

describe('getStaticContent', () => {
  it('静的 JSON を返す', async () => {
    const { fn, calls } = makeFetch([
      { match: 'statics.tver.jp/content/episode', respond: () => mockResponse(STATIC_CONTENT) },
    ]);
    const c = await getStaticContent('ep1wxk911o', '12', fn);
    expect(c.streaks?.projectID).toBe('tver-ytv');
    expect(calls[0].url).toContain('.json?v=12');
  });

  it('非OKなら TverUpstreamError', async () => {
    const { fn } = makeFetch([
      { match: 'statics.tver.jp', respond: () => mockResponse({}, { status: 404 }) },
    ]);
    await expect(getStaticContent('ep1', '5', fn)).rejects.toBeInstanceOf(TverUpstreamError);
  });
});

// ---- resolveStreaksPlayback ----------------------------------------------

describe('resolveStreaksPlayback', () => {
  it('非DRMの m3u8 を採用し、DRM ソースを除外、字幕を抽出する', async () => {
    const { fn, calls } = makeFetch([
      { match: 'playback.api.streaks.jp', respond: () => mockResponse(PLAYBACK_OK) },
    ]);
    const r = await resolveStreaksPlayback('tver-ytv', 'ref:dearhusband-ytv-01-260702', 'KEY-JAN-JUL', fn);
    expect(r.videoUrl).toContain('manifest.streaks.jp');
    expect(r.m3u8Urls).toHaveLength(1); // DRM は除外
    expect(r.subtitles).toEqual([{ lang: 'ja', url: 'https://example/sub.vtt' }]); // thumbnails は除外
    expect(r.duration).toBeCloseTo(2597.061);
    expect(r.backend).toBe('streaks');
    // Origin: tver.jp と API キーが送られていること
    expect((calls[0].init?.headers as Record<string, string>)['Origin']).toBe('https://tver.jp');
    expect((calls[0].init?.headers as Record<string, string>)['X-Streaks-Api-Key']).toBe('KEY-JAN-JUL');
  });

  it('403 id124 → TverGeoRestrictedError', async () => {
    const { fn } = makeFetch([
      { match: 'playback.api.streaks.jp', respond: () => mockResponse({ id: 124, code: 'REQUEST_FAILED', message: 'geo' }, { status: 403 }) },
    ]);
    await expect(resolveStreaksPlayback('p', 'ref:x', 'k', fn)).rejects.toBeInstanceOf(TverGeoRestrictedError);
  });

  it('403 id126 → TverApiKeyError', async () => {
    const { fn } = makeFetch([
      { match: 'playback.api.streaks.jp', respond: () => mockResponse({ id: 126, code: 'REQUEST_FAILED', message: 'key' }, { status: 403 }) },
    ]);
    await expect(resolveStreaksPlayback('p', 'ref:x', 'k', fn)).rejects.toBeInstanceOf(TverApiKeyError);
  });

  it('403 id139(Origin不正/視聴不可) → TverStreamNotFoundError', async () => {
    const { fn } = makeFetch([
      { match: 'playback.api.streaks.jp', respond: () => mockResponse({ id: 139, code: 'REQUEST_FAILED', message: 'この動画の視聴は許可されていません。' }, { status: 403 }) },
    ]);
    await expect(resolveStreaksPlayback('p', 'ref:x', 'k', fn)).rejects.toBeInstanceOf(TverStreamNotFoundError);
  });

  it('MEDIA_NOT_FOUND → TverStreamNotFoundError', async () => {
    const { fn } = makeFetch([
      { match: 'playback.api.streaks.jp', respond: () => mockResponse({ code: 'MEDIA_NOT_FOUND', message: 'nf' }, { status: 404 }) },
    ]);
    await expect(resolveStreaksPlayback('p', 'ref:x', 'k', fn)).rejects.toBeInstanceOf(TverStreamNotFoundError);
  });

  it('DRMのみで m3u8 が無い場合はエラー', async () => {
    const drmOnly = { ...PLAYBACK_OK, sources: [{ type: 'application/dash+xml', src: 'https://x/dash.mpd', key_systems: { wv: {} } }] };
    const { fn } = makeFetch([
      { match: 'playback.api.streaks.jp', respond: () => mockResponse(drmOnly) },
    ]);
    await expect(resolveStreaksPlayback('p', 'ref:x', 'k', fn)).rejects.toBeInstanceOf(TverStreamNotFoundError);
  });
});

// ---- resolveEpisodeStream(オーケストレーション) --------------------------

describe('resolveEpisodeStream', () => {
  function fullFetch() {
    return makeFetch([
      { match: 'callEpisode', respond: () => mockResponse({ result: { episode: { content: { version: 12 } } } }) },
      { match: 'statics.tver.jp', respond: () => mockResponse(STATIC_CONTENT) },
      { match: 'playback.api.streaks.jp', respond: () => mockResponse(PLAYBACK_OK) },
    ]);
  }

  it('セッション/streaks_info を注入して m3u8 を解決する', async () => {
    const now = new Date(Date.UTC(2026, 6, 5)); // 7月 → key01
    const { fn, calls } = fullFetch();
    const r = await resolveEpisodeStream('ep1wxk911o', {
      fetchFn: fn,
      now,
      session: SESSION,
      streaksInfo: STREAKS_INFO,
    });
    expect(r.videoUrl).toContain('manifest.streaks.jp');
    expect(r.title).toBe('親愛なる夫へ 1話');
    // 7月なので key01 のキーが使われる
    const pbCall = calls.find((c) => c.url.includes('playback.api.streaks.jp'))!;
    expect((pbCall.init?.headers as Record<string, string>)['X-Streaks-Api-Key']).toBe('KEY-JAN-JUL');
    // ref: 接頭辞が付与される
    expect(pbCall.url).toContain('/medias/ref:dearhusband-ytv-01-260702');
  });

  it('12月は key06 を選ぶ', async () => {
    const now = new Date(Date.UTC(2026, 11, 15)); // 12月 → key06
    const { fn, calls } = fullFetch();
    await resolveEpisodeStream('ep1wxk911o', { fetchFn: fn, now, session: SESSION, streaksInfo: STREAKS_INFO });
    const pbCall = calls.find((c) => c.url.includes('playback.api.streaks.jp'))!;
    expect((pbCall.init?.headers as Record<string, string>)['X-Streaks-Api-Key']).toBe('KEY-JUN-DEC');
  });

  it('streaks 参照が無ければ TverStreamNotFoundError', async () => {
    const noStreaks = { ...STATIC_CONTENT, streaks: undefined };
    const { fn } = makeFetch([
      { match: 'callEpisode', respond: () => mockResponse({ result: { episode: { content: { version: 12 } } } }) },
      { match: 'statics.tver.jp', respond: () => mockResponse(noStreaks) },
    ]);
    await expect(
      resolveEpisodeStream('ep1', { fetchFn: fn, session: SESSION, streaksInfo: STREAKS_INFO }),
    ).rejects.toBeInstanceOf(TverStreamNotFoundError);
  });

  it('該当プロジェクトのキーが無ければ TverApiKeyError', async () => {
    const now = new Date(Date.UTC(2026, 6, 5));
    const { fn } = makeFetch([
      { match: 'callEpisode', respond: () => mockResponse({ result: { episode: { content: { version: 12 } } } }) },
      { match: 'statics.tver.jp', respond: () => mockResponse(STATIC_CONTENT) },
    ]);
    await expect(
      resolveEpisodeStream('ep1', { fetchFn: fn, now, session: SESSION, streaksInfo: {} }),
    ).rejects.toBeInstanceOf(TverApiKeyError);
  });

  it('空の episodeId は弾く', async () => {
    await expect(resolveEpisodeStream('')).rejects.toThrow();
  });
});
