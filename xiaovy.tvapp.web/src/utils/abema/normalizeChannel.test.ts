import { describe, expect, it } from 'vitest';
import { normalizeChannel, normalizeChannels } from './normalizeChannel';

describe('normalizeChannel', () => {
  it('normalizes valid channels with watch url', () => {
    expect(normalizeChannel({
      id: 'abema-news',
      name: 'ABEMA NEWS',
      gnid: 'news',
      playback: { hls: 'https://example.test/master.m3u8', dash: 'https://example.test/manifest.mpd' },
    })).toEqual({
      id: 'abema-news',
      name: 'ABEMA NEWS',
      gnid: 'news',
      hls: 'https://example.test/master.m3u8',
      dash: 'https://example.test/manifest.mpd',
      watchUrl: 'https://abema.tv/now-on-air/abema-news',
    });
  });

  it('drops incomplete channels', () => {
    expect(normalizeChannels([{ id: 'x' }, { name: 'missing id' }, { id: 'ok', name: 'OK' }])).toHaveLength(1);
  });
});
