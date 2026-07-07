import { describe, expect, it } from 'vitest';
import {
  contentTypeForUrl,
  createHlsProxyUrl,
  isAllowedStreaksUrl,
  isM3u8Resource,
  rewriteM3u8Urls,
} from './hlsProxy';

describe('hlsProxy utils', () => {
  it('allows only https streaks hosts', () => {
    expect(isAllowedStreaksUrl('https://manifest.streaks.jp/path/master.m3u8')).toBe(true);
    expect(isAllowedStreaksUrl('https://variants.streaks.jp/seg.ts')).toBe(true);
    expect(isAllowedStreaksUrl('https://streaks.jp/seg.ts')).toBe(true);
    expect(isAllowedStreaksUrl('http://manifest.streaks.jp/path/master.m3u8')).toBe(false);
    expect(isAllowedStreaksUrl('https://streaks.jp.evil.test/path/master.m3u8')).toBe(false);
    expect(isAllowedStreaksUrl('not-a-url')).toBe(false);
  });

  it('builds same-origin proxy URLs', () => {
    const source = 'https://manifest.streaks.jp/v6/master.m3u8?token=a+b&x=1';
    expect(createHlsProxyUrl(source)).toBe(
      '/api/service/stream/hls?url=https%3A%2F%2Fmanifest.streaks.jp%2Fv6%2Fmaster.m3u8%3Ftoken%3Da%2Bb%26x%3D1',
    );
  });

  it('detects m3u8 from content type or URL path', () => {
    expect(isM3u8Resource('https://manifest.streaks.jp/master', 'application/vnd.apple.mpegurl; charset=utf-8')).toBe(
      true,
    );
    expect(isM3u8Resource('https://manifest.streaks.jp/master.m3u8?token=abc')).toBe(true);
    expect(isM3u8Resource('https://variants.streaks.jp/segment.ts', 'video/mp2t')).toBe(false);
  });

  it('chooses a useful fallback content type', () => {
    expect(contentTypeForUrl('https://manifest.streaks.jp/master.m3u8')).toBe('application/vnd.apple.mpegurl');
    expect(contentTypeForUrl('https://variants.streaks.jp/segment.ts')).toBe('video/mp2t');
    expect(contentTypeForUrl('https://variants.streaks.jp/key.bin', 'application/octet-stream')).toBe(
      'application/octet-stream',
    );
  });

  it('rewrites media playlists, child playlists, map URIs, and key URIs through the proxy', () => {
    const playlistUrl = 'https://manifest.streaks.jp/v6/tver/show/hls/master.m3u8?token=top';
    const playlist = [
      '#EXTM3U',
      '#EXT-X-STREAM-INF:BANDWIDTH=1280000',
      'variant/index.m3u8',
      '#EXT-X-KEY:METHOD=AES-128,URI="../keys/key.bin?sig=1",IV=0x123',
      '#EXT-X-MAP:URI="https://variants.streaks.jp/init.mp4?sig=2"',
      '#EXTINF:6.0,',
      'https://variants.streaks.jp/video/segment001.ts?sig=3',
      '#EXTINF:6.0,',
      'segment002.ts',
      '#EXT-X-ENDLIST',
    ].join('\n');

    const rewritten = rewriteM3u8Urls(playlist, playlistUrl);

    expect(rewritten).toContain(
      '/api/service/stream/hls?url=https%3A%2F%2Fmanifest.streaks.jp%2Fv6%2Ftver%2Fshow%2Fhls%2Fvariant%2Findex.m3u8',
    );
    expect(rewritten).toContain(
      'URI="/api/service/stream/hls?url=https%3A%2F%2Fmanifest.streaks.jp%2Fv6%2Ftver%2Fshow%2Fkeys%2Fkey.bin%3Fsig%3D1"',
    );
    expect(rewritten).toContain(
      'URI="/api/service/stream/hls?url=https%3A%2F%2Fvariants.streaks.jp%2Finit.mp4%3Fsig%3D2"',
    );
    expect(rewritten).toContain(
      '/api/service/stream/hls?url=https%3A%2F%2Fvariants.streaks.jp%2Fvideo%2Fsegment001.ts%3Fsig%3D3',
    );
    expect(rewritten).toContain(
      '/api/service/stream/hls?url=https%3A%2F%2Fmanifest.streaks.jp%2Fv6%2Ftver%2Fshow%2Fhls%2Fsegment002.ts',
    );
  });

  it('does not rewrite comments, data URIs, or non-streaks URLs', () => {
    const playlist = [
      '#EXTM3U',
      '#EXT-X-KEY:METHOD=AES-128,URI="data:text/plain;base64,AAAA"',
      '#EXT-X-MAP:URI="https://example.test/init.mp4"',
      'https://example.test/segment.ts',
    ].join('\n');

    expect(rewriteM3u8Urls(playlist, 'https://manifest.streaks.jp/master.m3u8')).toBe(playlist);
  });
});
