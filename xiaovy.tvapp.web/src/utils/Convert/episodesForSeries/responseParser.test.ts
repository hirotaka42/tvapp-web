import { describe, expect, it } from 'vitest';
import { convertCardContents, convertCardContentsBySeason } from './responseParser';

function episode(id: string, title: string) {
  return {
    type: 'episode',
    content: {
      id,
      title,
      seriesID: 'series-1',
      endAt: 1_800,
      seriesTitle: 'シリーズ',
      broadcasterName: '放送局',
      productionProviderName: '制作',
      broadcastDateLabel: '7月7日(火)',
    },
  };
}

function response() {
  return {
    data: {
      result: {
        contents: [
          { seasonTitle: 'シーズン1', contents: [episode('ep-1', '第1話'), { type: 'series', content: { id: 'series-1' } }] },
          { seasonTitle: 'シーズン2', contents: [episode('ep-2', '第2話')] },
          { seasonTitle: '空シーズン', contents: [{ type: 'series', content: { id: 'series-2' } }] },
        ],
      },
    },
  };
}

describe('episodesForSeries responseParser', () => {
  it('episode のみカード表示用データに変換する', () => {
    const contents = convertCardContents(response() as any);

    expect(contents).toHaveLength(2);
    expect(contents[0]).toMatchObject({
      id: 'ep-1',
      title: '第1話',
      rank: 0,
      thumbnail: {
        small: 'https://statics.tver.jp/images/content/thumbnail/episode/small/ep-1.jpg',
        xlarge: 'https://statics.tver.jp/images/content/thumbnail/episode/xlarge/ep-1.jpg',
      },
    });
  });

  it('episode があるシーズンだけシーズン単位で返す', () => {
    const seasons = convertCardContentsBySeason(response() as any);

    expect(seasons.map((season) => season.seasonTitle)).toEqual(['シーズン1', 'シーズン2']);
    expect(seasons[1].contents[0].id).toBe('ep-2');
  });
});
