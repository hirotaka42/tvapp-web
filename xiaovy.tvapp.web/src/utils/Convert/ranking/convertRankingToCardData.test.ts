import { describe, expect, it } from 'vitest';
import { convertRankingToCardData } from './convertRankingToCardData';

describe('convertRankingToCardData', () => {
  it('ランキングレスポンスをカード表示用データに変換する', () => {
    const result = convertRankingToCardData({
      contents: [
        {
          content: {
            id: 'ep-1',
            title: '第1話',
            seriesID: 'series-1',
            endAt: 100,
            seriesTitle: 'シリーズ',
            broadcasterName: '放送局',
            productionProviderName: '制作',
            broadcastDateLabel: '7月7日(火)',
            rank: 3,
          },
        },
      ],
    } as any);

    expect(result).toEqual([
      {
        id: 'ep-1',
        title: '第1話',
        seriesID: 'series-1',
        endAt: 100,
        seriesTitle: 'シリーズ',
        broadcasterName: '放送局',
        productionProviderName: '制作',
        broadcastDateLabel: '7月7日(火)',
        thumbnail: {
          small: 'https://statics.tver.jp/images/content/thumbnail/episode/small/ep-1.jpg',
          xlarge: 'https://statics.tver.jp/images/content/thumbnail/episode/xlarge/ep-1.jpg',
        },
        rank: 3,
      },
    ]);
  });

  it('空の contents は空配列を返す', () => {
    expect(convertRankingToCardData({ contents: [] } as any)).toEqual([]);
  });
});
