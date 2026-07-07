import { describe, expect, it } from 'vitest';
import { classifyNewsCategory, isRevenueBlocked, shouldKeepNewsItem } from '../src/revenueFilter.mjs';

describe('revenueFilter', () => {
  it('blocks box-office and ranking language exactly as forward-looking noise', () => {
    expect(isRevenueBlocked('週末興行ランキングで興収10億円を突破')).toBe(true);
    expect(shouldKeepNewsItem({
      source: 'eiga_com',
      title: '【国内映画ランキング】サンプルが初登場1位',
      summary: '',
    })).toBe(false);
  });

  it('keeps allowed forward-looking movie news and classifies category', () => {
    const item = {
      source: 'natalie',
      title: '映画「サンプル」本予告が解禁、主演キャストも発表',
      summary: '劇場公開に向けて新映像が公開された。',
    };

    expect(shouldKeepNewsItem(item)).toBe(true);
    expect(classifyNewsCategory(`${item.title}\n${item.summary}`)).toBe('cast');
  });

  it('drops non-film natalie/realsound entries and Real Sound SNS tag', () => {
    expect(shouldKeepNewsItem({
      source: 'natalie',
      title: '音楽イベントの追加出演者が決定',
      summary: 'ライブ情報です。',
    })).toBe(false);
    expect(shouldKeepNewsItem({
      source: 'realsound',
      title: '映画「サンプル」新写真公開',
      summary: '劇場公開される。',
      tags: ['映画部SNSニュース'],
    })).toBe(false);
  });
});
