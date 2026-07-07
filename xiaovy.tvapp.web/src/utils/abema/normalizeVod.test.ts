import { describe, expect, it } from 'vitest';
import { normalizeVod } from './normalizeVod';

describe('normalizeVod', () => {
  it('normalizes ABEMA VOD modules into shelves', () => {
    const shelves = normalizeVod({
      modules: [
        {
          id: 'ranking-1',
          nameFormat: '今日の総合ランキングTOP20',
          itemUiType: 'ITEM_UI_TYPE_RANKING',
          items: [
            {
              contentId: '90-1849_s3',
              contentType: 'CONTENT_TYPE_SEASON',
              title: 'ガールオアレディ 3 | ガールオアレディ',
              thumb: {
                urlPrefix: 'https://image.p-c2-x.abema-tv.com/image/seasons/90-1849_s3',
                filename: 'default_thumb.png',
                query: 'version=1781247955',
                extension: 'png',
              },
              label: { free: true },
            },
            {
              contentId: 'broken',
              contentType: 'CONTENT_TYPE_SERIES',
            },
          ],
        },
      ],
    });

    expect(shelves).toEqual([
      {
        key: 'ranking-1',
        title: '今日の総合ランキングTOP20',
        uiType: 'ITEM_UI_TYPE_RANKING',
        items: [
          {
            contentId: '90-1849_s3',
            contentType: 'CONTENT_TYPE_SEASON',
            title: 'ガールオアレディ 3 | ガールオアレディ',
            thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/seasons/90-1849_s3/default_thumb.png?version=1781247955',
            isFree: true,
          },
        ],
      },
    ]);
  });

  it('falls back to module name and omits optional fields', () => {
    const shelves = normalizeVod({
      modules: [
        {
          name: '新着',
          items: [
            {
              contentId: '210-18',
              contentType: 'CONTENT_TYPE_SERIES',
              title: '無職転生',
              label: { newest: true },
            },
          ],
        },
        {
          id: 'missing-title',
          items: [],
        },
      ],
    });

    expect(shelves).toEqual([
      {
        key: '新着',
        title: '新着',
        uiType: undefined,
        items: [
          {
            contentId: '210-18',
            contentType: 'CONTENT_TYPE_SERIES',
            title: '無職転生',
            thumbnailUrl: undefined,
            isFree: undefined,
          },
        ],
      },
    ]);
  });
});
