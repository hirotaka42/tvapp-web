import { describe, expect, it } from 'vitest';
import { AbemaLiveSlot, AbemaSlot } from '@/types/abema/view';
import { deriveTicker } from './deriveTicker';

const base: AbemaSlot = {
  id: 'slot',
  channelId: 'ch',
  title: 'Title',
  startAt: 0,
  endAt: 0,
  startMs: Date.UTC(2026, 0, 1, 12, 0),
  endMs: Date.UTC(2026, 0, 1, 13, 0),
  labels: [],
  thumbKey: 'ag1',
  watchUrl: 'https://abema.tv',
};

describe('deriveTicker', () => {
  it('mixes live and reserve items', () => {
    const live: AbemaLiveSlot = { ...base, id: 'live', progressPercent: 20 };
    const items = deriveTicker([live], [{ ...base, id: 'next', title: 'Next' }], 2);

    expect(items).toEqual([
      { id: 'live-live', badge: 'LIVE', badgeVariant: 'live', text: 'Title' },
      { id: 'next-next', badge: '21:00', badgeVariant: 'reserve', text: 'Next' },
    ]);
  });
});
