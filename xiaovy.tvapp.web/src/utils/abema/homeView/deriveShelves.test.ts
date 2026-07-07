import { describe, expect, it } from 'vitest';
import { AbemaChannel, AbemaSlot } from '@/types/abema/view';
import { deriveShelves } from './deriveShelves';

const channels: AbemaChannel[] = [
  { id: 'anime', name: 'アニメチャンネル', watchUrl: 'https://abema.tv' },
  { id: 'news', name: 'ニュース', watchUrl: 'https://abema.tv' },
];

function slot(id: string, channelId: string, startMs: number, labels: string[] = []): AbemaSlot {
  return {
    id,
    channelId,
    title: id,
    startAt: startMs / 1000,
    endAt: startMs / 1000 + 3600,
    startMs,
    endMs: startMs + 3600000,
    labels,
    thumbKey: 'ag1',
    watchUrl: 'https://abema.tv',
  };
}

describe('deriveShelves', () => {
  it('derives honest EPG-based shelves without ranking wording', () => {
    const shelves = deriveShelves([
      slot('live', 'news', 0),
      slot('anime-future', 'anime', 2000, ['anime']),
    ], channels, 1000);

    expect(shelves.map((shelf) => shelf.title)).toContain('生放送中');
    expect(shelves.map((shelf) => shelf.title).join(' ')).not.toContain('ランキング');
    expect(shelves.every((shelf) => shelf.note === '番組表より抽出')).toBe(true);
  });
});
