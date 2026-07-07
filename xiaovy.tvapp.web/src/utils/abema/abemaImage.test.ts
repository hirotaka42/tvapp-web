import { describe, expect, it } from 'vitest';
import { abemaEpisodeStillUrl, buildAbemaThumbnailUrl } from './abemaImage';

describe('abemaImage', () => {
  it('builds ABEMA episode still URLs with the standard size query', () => {
    expect(abemaEpisodeStillUrl('210-18_s1_p1')).toBe(
      'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p1/thumb001.png?height=158&width=280&quality=75',
    );
  });

  it('builds component thumbnail URLs', () => {
    expect(buildAbemaThumbnailUrl({
      urlPrefix: 'https://image.p-c2-x.abema-tv.com/image/series/210-18',
      filename: 'series_thumb.png',
      query: 'version=1',
    })).toBe('https://image.p-c2-x.abema-tv.com/image/series/210-18/series_thumb.png?version=1');
  });
});
