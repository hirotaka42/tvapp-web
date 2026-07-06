import { describe, expect, it } from 'vitest';
import { convertContent, getAllLabels, getContentsByLabel, getLabelContentCounts } from './responseParser';

const content = {
  rank: 2,
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
};

const response = {
  data: {
    result: {
      components: [
        { label: '人気', contents: [content] },
        { label: '新着', contents: [{ content: { id: 'ep-2' } }] },
      ],
    },
  },
};

describe('home responseParser', () => {
  it('個別 content を既定値付きで変換する', () => {
    expect(convertContent(content as any)).toMatchObject({
      content: {
        id: 'ep-1',
        title: '第1話',
        rank: 2,
      },
    });

    expect(convertContent({ content: { id: 'ep-empty' } } as any)).toEqual({
      content: {
        id: 'ep-empty',
        title: '',
        seriesID: '',
        endAt: 0,
        seriesTitle: '',
        broadcasterName: '',
        productionProviderName: '',
        broadcastDateLabel: '',
        rank: 0,
      },
    });
  });

  it('指定ラベルの contents、全ラベル、件数を返す', () => {
    expect(getContentsByLabel(response as any, '人気')).toMatchObject({ label: '人気', contents: [{ content: { id: 'ep-1' } }] });
    expect(getContentsByLabel(response as any, '存在しない')).toEqual({ label: '', contents: [] });
    expect(getAllLabels(response as any)).toEqual(['人気', '新着']);
    expect(getLabelContentCounts(response as any)).toEqual({ '人気': 1, '新着': 1 });
  });

  it('レスポンス欠損時は空結果を返す', () => {
    expect(getContentsByLabel(undefined as any, '人気')).toEqual({ label: '', contents: [] });
    expect(getAllLabels({} as any)).toEqual([]);
    expect(getLabelContentCounts({ data: {} } as any)).toEqual({});
  });
});
