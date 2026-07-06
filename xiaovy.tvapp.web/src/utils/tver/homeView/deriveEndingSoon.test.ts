import { describe, expect, it } from 'vitest';
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { deriveEndingSoon } from './deriveEndingSoon';

const now = new Date('2026-07-07T10:00:00+09:00').getTime();
const todayEnd = Math.floor(new Date('2026-07-07T23:59:00+09:00').getTime() / 1000);
const tomorrowEnd = Math.floor(new Date('2026-07-08T23:59:00+09:00').getTime() / 1000);

function item(id: string, endAt = todayEnd): ConvertedContent {
  return {
    id,
    title: id,
    seriesID: id,
    endAt,
    seriesTitle: id,
    broadcasterName: 'TV',
    productionProviderName: 'TV',
    broadcastDateLabel: '7月7日放送',
    thumbnail: { small: '/a.jpg', xlarge: '/b.jpg' },
    rank: 1,
  };
}

describe('deriveEndingSoon', () => {
  it('extracts same-day endings across labels and deduplicates ids', () => {
    const result = deriveEndingSoon({ a: [item('1'), item('2', tomorrowEnd)], b: [item('1'), item('3')] }, now);
    expect(result.map((content) => content.id)).toEqual(['1', '3']);
  });

  it('limits to four items', () => {
    const result = deriveEndingSoon({ a: ['1', '2', '3', '4', '5'].map((id) => item(id)) }, now);
    expect(result).toHaveLength(4);
  });

  it('returns empty when nothing matches', () => {
    expect(deriveEndingSoon({ a: [item('1', tomorrowEnd)] }, now)).toEqual([]);
  });
});
