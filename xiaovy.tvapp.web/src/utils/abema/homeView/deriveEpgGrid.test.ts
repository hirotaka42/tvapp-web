import { describe, expect, it } from 'vitest';
import { AbemaChannel, AbemaSlot } from '@/types/abema/view';
import { deriveEpgGrid } from './deriveEpgGrid';

const channels: AbemaChannel[] = [
  { id: 'news', name: 'News', watchUrl: 'https://abema.tv/now-on-air/news' },
  { id: 'anime', name: 'Anime', watchUrl: 'https://abema.tv/now-on-air/anime' },
];

function slot(id: string, channelId: string, startMs: number, endMs: number): AbemaSlot {
  return {
    id,
    channelId,
    title: id,
    startAt: startMs / 1000,
    endAt: endMs / 1000,
    startMs,
    endMs,
    labels: [],
    thumbKey: 'ag1',
    watchUrl: 'https://abema.tv',
  };
}

describe('deriveEpgGrid', () => {
  it('clips slots to the visible window and keeps rows with cells', () => {
    const now = Date.UTC(2026, 0, 1, 12, 15);
    const grid = deriveEpgGrid(channels, [
      slot('live', 'news', now - 60 * 60 * 1000, now + 60 * 60 * 1000),
      slot('outside', 'anime', now + 8 * 60 * 60 * 1000, now + 9 * 60 * 60 * 1000),
    ], now, 2, 30);

    expect(grid.columns).toHaveLength(4);
    expect(grid.rows).toHaveLength(1);
    expect(grid.rows[0].cells[0]).toMatchObject({ colStart: 2, colSpan: 4, isLive: true });
    expect(grid.nowPercent).toBeGreaterThan(0);
  });
});
