import { describe, expect, it } from 'vitest';
import convertEpisodeRankingResponse, { convertEpisodeRankingResponse as namedConvert } from './responseParser';

const validResponse = {
  data: {
    result: {
      contents: {
        content: { title: 'ドラマランキング' },
        contents: [
          {
            rank: 1,
            content: {
              id: 'ep-1',
              title: '第1話',
              seriesID: 'series-1',
              endAt: 100,
              seriesTitle: 'シリーズ',
              broadcasterName: '放送局',
              productionProviderName: '制作',
              broadcastDateLabel: '7月7日(火)',
            },
          },
        ],
      },
    },
  },
};

describe('genreDetail responseParser', () => {
  it('ジャンル別ランキングレスポンスを変換する', () => {
    expect(namedConvert(validResponse as any)).toEqual({
      label: 'ドラマランキング',
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
            rank: 1,
          },
        },
      ],
    });
  });

  it('レスポンスが欠損している場合は空結果を返す', () => {
    expect(convertEpisodeRankingResponse(undefined as any)).toEqual({ label: '', contents: [] });
    expect(convertEpisodeRankingResponse({ data: { result: {} } } as any)).toEqual({ label: '', contents: [] });
    expect(convertEpisodeRankingResponse({ data: { result: { contents: {} } } } as any)).toEqual({ label: '', contents: [] });
  });
});
