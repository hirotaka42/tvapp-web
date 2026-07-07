import { describe, expect, it } from 'vitest';
import {
  contentTypeForAbemaUrl,
  createAbemaHlsProxyUrl,
  createAbemaKeyUrl,
  isAbemaM3u8Resource,
  isAllowedAbemaHlsUrl,
  rewriteAbemaM3u8,
} from './hlsRewrite';

describe('abema hls rewrite utils', () => {
  it('allows only https ABEMA/Akamai HLS hosts', () => {
    expect(isAllowedAbemaHlsUrl('https://linear-abematv.akamaized.net/channel/news/playlist.m3u8')).toBe(true);
    expect(isAllowedAbemaHlsUrl('https://vod-abematv.akamaized.net/program/playlist.m3u8')).toBe(true);
    expect(isAllowedAbemaHlsUrl('https://example.akamaized.net/segment.ts')).toBe(true);
    expect(isAllowedAbemaHlsUrl('http://linear-abematv.akamaized.net/channel/news/playlist.m3u8')).toBe(false);
    expect(isAllowedAbemaHlsUrl('https://akamaized.net.evil.test/segment.ts')).toBe(false);
  });

  it('builds proxy and key URLs', () => {
    expect(createAbemaHlsProxyUrl('https://linear-abematv.akamaized.net/a.m3u8', 's1')).toBe(
      '/api/service/abema/hls?src=https%3A%2F%2Flinear-abematv.akamaized.net%2Fa.m3u8&sid=s1',
    );
    expect(createAbemaKeyUrl('ticket+1', 's1')).toBe('/api/service/abema/key?ticket=ticket%2B1&sid=s1');
  });

  it('detects m3u8 resources and content types', () => {
    expect(isAbemaM3u8Resource('https://linear-abematv.akamaized.net/a', 'application/x-mpegURL; charset=utf-8')).toBe(true);
    expect(isAbemaM3u8Resource('https://linear-abematv.akamaized.net/a.m3u8')).toBe(true);
    expect(isAbemaM3u8Resource('https://linear-abematv.akamaized.net/a.ts', 'video/mp2t')).toBe(false);
    expect(contentTypeForAbemaUrl('https://linear-abematv.akamaized.net/a.m3u8')).toBe('application/vnd.apple.mpegurl');
    expect(contentTypeForAbemaUrl('https://linear-abematv.akamaized.net/a.ts')).toBe('video/mp2t');
  });

  it('rewrites ABEMA license keys and preserves METHOD=NONE ad sections', () => {
    const playlist = [
      '#EXTM3U',
      '#EXT-X-KEY:METHOD=AES-128,URI="abematv-license://ticket-a",IV=0x0001',
      'segment001.ts',
      '#EXT-X-KEY:METHOD=NONE',
      'ad001.ts',
      '#EXT-X-KEY:METHOD=AES-128,URI="abematv-license://ticket-b",IV=0x0002',
      'nested/media.m3u8',
    ].join('\n');

    const rewritten = rewriteAbemaM3u8(playlist, 'https://linear-abematv.akamaized.net/channel/news/1080/playlist.m3u8', {
      sessionId: 'sid-1',
    });

    expect(rewritten).toContain('URI="/api/service/abema/key?ticket=ticket-a&sid=sid-1",IV=0x0001');
    expect(rewritten).toContain('#EXT-X-KEY:METHOD=NONE');
    expect(rewritten).toContain('https://linear-abematv.akamaized.net/channel/news/1080/segment001.ts');
    expect(rewritten).toContain('https://linear-abematv.akamaized.net/channel/news/1080/ad001.ts');
    expect(rewritten).toContain(
      '/api/service/abema/hls?src=https%3A%2F%2Flinear-abematv.akamaized.net%2Fchannel%2Fnews%2F1080%2Fnested%2Fmedia.m3u8&sid=sid-1',
    );
  });

  it('rewrites URI attributes but leaves non-http and license URI outside EXT-X-KEY alone', () => {
    const playlist = [
      '#EXT-X-MAP:URI="init.mp4"',
      '#EXT-X-SESSION-DATA:URI="data:text/plain,hello"',
      '#EXT-X-SESSION-DATA:URI="abematv-license://ignored"',
    ].join('\n');

    const rewritten = rewriteAbemaM3u8(playlist, 'https://vod-abematv.akamaized.net/path/master.m3u8');

    expect(rewritten).toContain('URI="https://vod-abematv.akamaized.net/path/init.mp4"');
    expect(rewritten).toContain('URI="data:text/plain,hello"');
    expect(rewritten).toContain('URI="abematv-license://ignored"');
  });
});
