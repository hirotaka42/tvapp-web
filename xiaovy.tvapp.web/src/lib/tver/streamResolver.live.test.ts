/**
 * ライブ疎通テスト(実 TVER API に接続)。
 * 既定では vitest.config.ts の exclude で除外され、`npm run test:live` (TVER_LIVE=1) でのみ走る。
 * 日本国内 IP からの実行を前提とする(TVER は JP 限定)。コンテンツが入れ替わっても
 * 壊れないよう、ランキング先頭の実エピソード ID を都度取得して解決する。
 */
import { describe, it, expect } from 'vitest';
import { resolveEpisodeStream, createSession } from './streamResolver';

describe('resolveEpisodeStream (LIVE)', () => {
  it('ランキング先頭エピソードの m3u8 を解決できる', async () => {
    // 実エピソード ID をドラマランキングから取得
    const rankRes = await fetch(
      'https://service-api.tver.jp/api/v1/callEpisodeRankingDetail/drama',
      { headers: { 'x-tver-platform-type': 'web', Origin: 'https://tver.jp', Referer: 'https://tver.jp/' } },
    );
    expect(rankRes.ok).toBe(true);
    const rank = (await rankRes.json()) as {
      result: { contents: { contents: Array<{ content: { id: string } }> } };
    };
    const episodeId = rank.result.contents.contents[0].content.id;
    expect(episodeId).toMatch(/^ep/);

    const session = await createSession();
    const stream = await resolveEpisodeStream(episodeId, { session });

    expect(stream.backend).toBe('streaks');
    expect(stream.videoUrl).toMatch(/^https:\/\/.+\.m3u8/);
    expect(stream.m3u8Urls.length).toBeGreaterThan(0);

    // 実際に m3u8 マニフェストが取得できることまで確認
    const m3u = await fetch(stream.videoUrl);
    expect(m3u.ok).toBe(true);
    const text = await m3u.text();
    expect(text).toContain('#EXTM3U');
  }, 30_000);
});
