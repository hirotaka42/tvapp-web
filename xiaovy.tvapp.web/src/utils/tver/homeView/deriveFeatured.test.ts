import { describe, expect, it } from 'vitest';
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { deriveFeatured } from './deriveFeatured';

const base: ConvertedContent = {
  id: 'ep1',
  title: 'Episode title',
  seriesID: 'sr1',
  endAt: 0,
  seriesTitle: 'Series title',
  broadcasterName: 'TBS',
  productionProviderName: 'TBS',
  broadcastDateLabel: '7月7日放送',
  thumbnail: { small: '/a.jpg', xlarge: '/b.jpg' },
  rank: 1,
};

describe('deriveFeatured', () => {
  it('returns null for empty input', () => {
    expect(deriveFeatured([])).toBeNull();
  });

  it('uses the first content', () => {
    expect(deriveFeatured([base, { ...base, id: 'ep2', rank: 2 }])?.id).toBe('ep1');
  });

  it('falls back to title when seriesTitle is missing', () => {
    expect(deriveFeatured([{ ...base, seriesTitle: '' }])?.displayTitle).toBe('Episode title');
  });
});
