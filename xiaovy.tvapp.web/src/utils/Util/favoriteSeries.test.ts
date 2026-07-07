import { beforeEach, describe, expect, it } from 'vitest';
import {
  createFavoriteSeries,
  deleteFavoriteSeriesByIndex,
  deleteFavoriteSeriesBySeriesId,
  isFavoriteSeriesExists,
  readFavoriteSeries,
  updateFavoriteSeries,
} from './favoriteSeries';

describe('favoriteSeries', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('お気に入りシリーズを新規作成し、追記して読み出す', () => {
    createFavoriteSeries('シリーズA', 'series-a');
    createFavoriteSeries('シリーズB', 'series-b');

    expect(readFavoriteSeries()).toEqual([
      { seriesTitle: 'シリーズA', seriesId: 'series-a' },
      { seriesTitle: 'シリーズB', seriesId: 'series-b' },
    ]);
  });

  it('保存がない場合は空配列を返す', () => {
    expect(readFavoriteSeries()).toEqual([]);
  });

  it('既存タイトルを更新し、存在しないタイトルは追加する', () => {
    createFavoriteSeries('シリーズA', 'old-id');

    updateFavoriteSeries('シリーズA', 'new-id');
    updateFavoriteSeries('シリーズB', 'series-b');

    expect(readFavoriteSeries()).toEqual([
      { seriesTitle: 'シリーズA', seriesId: 'new-id' },
      { seriesTitle: 'シリーズB', seriesId: 'series-b' },
    ]);
  });

  it('保存がない状態の更新は新規作成する', () => {
    updateFavoriteSeries('シリーズA', 'series-a');
    expect(readFavoriteSeries()).toEqual([{ seriesTitle: 'シリーズA', seriesId: 'series-a' }]);
  });

  it('index と seriesId で削除し、存在確認できる', () => {
    createFavoriteSeries('シリーズA', 'series-a');
    createFavoriteSeries('シリーズB', 'series-b');
    createFavoriteSeries('シリーズC', 'series-c');

    expect(isFavoriteSeriesExists('series-b')).toBe(true);
    deleteFavoriteSeriesByIndex(0);
    deleteFavoriteSeriesBySeriesId('series-c');

    expect(readFavoriteSeries()).toEqual([{ seriesTitle: 'シリーズB', seriesId: 'series-b' }]);
    expect(isFavoriteSeriesExists('series-a')).toBe(false);
  });

  it('保存がない場合の削除と存在確認は副作用なし', () => {
    deleteFavoriteSeriesByIndex(0);
    deleteFavoriteSeriesBySeriesId('series-a');
    expect(isFavoriteSeriesExists('series-a')).toBe(false);
  });
});
