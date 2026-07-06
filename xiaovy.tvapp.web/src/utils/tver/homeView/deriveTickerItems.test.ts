import { describe, expect, it } from 'vitest';
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { deriveTickerItems } from './deriveTickerItems';

const now = new Date('2026-07-07T10:00:00+09:00').getTime();
const todayEnd = Math.floor(new Date('2026-07-07T23:59:00+09:00').getTime() / 1000);

function item(id: string, rank: number, endAt = 0): ConvertedContent {
  return {
    id,
    title: `Title ${id}`,
    seriesID: `sr-${id}`,
    endAt,
    seriesTitle: `Series ${id}`,
    broadcasterName: 'TV',
    productionProviderName: 'TV',
    broadcastDateLabel: '7月7日放送',
    thumbnail: { small: '/a.jpg', xlarge: '/b.jpg' },
    rank,
  };
}

describe('deriveTickerItems', () => {
  it('returns empty for empty input', () => {
    expect(deriveTickerItems([], now)).toEqual([]);
  });

  it('respects the limit', () => {
    expect(deriveTickerItems([item('1', 1), item('2', 2), item('3', 3)], now, 2)).toHaveLength(2);
  });

  it('mixes ending labels with ranking labels', () => {
    const result = deriveTickerItems([item('1', 1), item('2', 5, todayEnd)], now);
    expect(result[0]).toMatchObject({ label: '急上昇', variant: 'trend' });
    expect(result[1]).toMatchObject({ label: 'まもなく終了', variant: 'ending' });
  });
});
