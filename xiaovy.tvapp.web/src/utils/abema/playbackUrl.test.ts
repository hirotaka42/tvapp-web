import { describe, expect, it } from 'vitest';
import { abemaPlaybackPath, abemaSlotPlaybackPath, abemaSlotPlaybackTarget, externalAbemaWatchUrl } from './playbackUrl';

const slot = {
  id: 'slot-1',
  channelId: 'abema-news',
  startMs: 1_000,
  endMs: 2_000,
};

describe('abema playback urls', () => {
  it('builds app playback paths', () => {
    expect(abemaPlaybackPath({ kind: 'live', id: 'abema news' })).toBe('/service/abema/live/abema%20news');
    expect(abemaPlaybackPath({ kind: 'watch', id: 'slot/1' })).toBe('/service/abema/watch/slot%2F1');
  });

  it('uses live route for on-air slots and watch route otherwise', () => {
    expect(abemaSlotPlaybackTarget(slot, 1_500)).toEqual({ kind: 'live', id: 'abema-news' });
    expect(abemaSlotPlaybackPath(slot, 500)).toBe('/service/abema/watch/slot-1');
    expect(abemaSlotPlaybackPath(slot, 2_000)).toBe('/service/abema/watch/slot-1');
  });

  it('keeps official ABEMA fallback urls available', () => {
    expect(externalAbemaWatchUrl({ kind: 'live', id: 'abema-news' })).toBe('https://abema.tv/now-on-air/abema-news');
    expect(externalAbemaWatchUrl({ kind: 'watch', id: 'slot 1' })).toBe('https://abema.tv/video/episode/slot%201');
  });
});
