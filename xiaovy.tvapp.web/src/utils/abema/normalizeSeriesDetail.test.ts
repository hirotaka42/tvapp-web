import { describe, expect, it } from 'vitest';
import { normalizeSeriesDetail } from './normalizeSeriesDetail';

describe('normalizeSeriesDetail', () => {
  it('normalizes seasons in series order and groups episodes by season id', () => {
    const detail = normalizeSeriesDetail(
      {
        id: '210-18',
        title: '追放された転生重騎士',
        content: 'シリーズ概要',
        genre: { id: 'animation', name: 'アニメ' },
        version: 123,
        thumbComponent: {
          urlPrefix: 'https://image.p-c2-x.abema-tv.com/image/series/210-18',
          filename: 'series_thumb.png',
          query: 'version=1',
          extension: 'png',
        },
        seasons: [
          { id: '210-18_s2', sequence: 2, name: 'シーズン2' },
          { id: '210-18_s1', sequence: 1, name: 'シーズン1' },
        ],
      },
      [
        {
          id: '210-18_s1_p2',
          season: { id: '210-18_s1', name: 'シーズン1' },
          episode: { number: 2, title: '第2話' },
          label: { newest: true },
        },
        {
          id: '210-18_s2_p1',
          season: { id: '210-18_s2', name: 'シーズン2' },
          episode: { number: 1, title: '第1話' },
          label: { free: true },
        },
        {
          id: '210-18_s1_p1',
          season: { id: '210-18_s1', name: 'シーズン1' },
          episode: { number: 1, title: '第1話' },
          label: { free: true },
          thumbComponent: {
            urlPrefix: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p1',
            filename: 'program_thumb.png',
            query: 'version=2',
            extension: 'png',
          },
        },
      ],
    );

    expect(detail).toEqual({
      id: '210-18',
      title: '追放された転生重騎士',
      description: 'シリーズ概要',
      genreName: 'アニメ',
      thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/series/210-18/series_thumb.png?version=1',
      seasons: [
        {
          id: '210-18_s2',
          name: 'シーズン2',
          sequence: 2,
          episodes: [
            {
              id: '210-18_s2_p1',
              number: 1,
              title: '第1話',
              isFree: true,
              isPremium: false,
              thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s2_p1/thumb001.png?height=158&width=280&quality=75',
            },
          ],
        },
        {
          id: '210-18_s1',
          name: 'シーズン1',
          sequence: 1,
          episodes: [
            {
              id: '210-18_s1_p1',
              number: 1,
              title: '第1話',
              isFree: true,
              isPremium: false,
              thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p1/thumb001.png?height=158&width=280&quality=75',
            },
            {
              id: '210-18_s1_p2',
              number: 2,
              title: '第2話',
              isFree: undefined,
              isPremium: true,
              thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p2/thumb001.png?height=158&width=280&quality=75',
            },
          ],
        },
      ],
    });
  });

  it('falls back to orderedSeasons and rejects missing required series fields', () => {
    expect(normalizeSeriesDetail({}, [])).toBeNull();

    expect(normalizeSeriesDetail({
      id: '210-18',
      title: '追放された転生重騎士',
      orderedSeasons: [{ id: '210-18_s1', name: 'シーズン1' }],
    }, [])).toEqual({
      id: '210-18',
      title: '追放された転生重騎士',
      description: undefined,
      genreName: undefined,
      thumbnailUrl: undefined,
      seasons: [
        {
          id: '210-18_s1',
          name: 'シーズン1',
          sequence: undefined,
          episodes: [],
        },
      ],
    });
  });

  it('falls back to orderedSeasons when seasons is empty', () => {
    expect(normalizeSeriesDetail({
      id: '149-11',
      title: '無職転生',
      seasons: [],
      orderedSeasons: [
        { id: '149-11_s1', name: '第1期' },
        { id: '149-11_s2', name: '第2期' },
      ],
    }, [
      { id: '149-11_s2_p1', season: { id: '149-11_s2' }, episode: { number: 1, title: '第1話' } },
    ])?.seasons).toEqual([
      {
        id: '149-11_s1',
        name: '第1期',
        sequence: undefined,
        episodes: [],
      },
      {
        id: '149-11_s2',
        name: '第2期',
        sequence: undefined,
        episodes: [
          {
            id: '149-11_s2_p1',
            number: 1,
            title: '第1話',
            isFree: undefined,
            isPremium: true,
            thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/149-11_s2_p1/thumb001.png?height=158&width=280&quality=75',
          },
        ],
      },
    ]);
  });
});
