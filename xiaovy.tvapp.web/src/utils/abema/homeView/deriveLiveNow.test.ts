import { describe, expect, it } from 'vitest';
import { AbemaSlot } from '@/types/abema/view';
import { deriveLiveNow } from './deriveLiveNow';

const base: AbemaSlot = {
  id: 'slot',
  channelId: 'ch',
  title: 'Title',
  startAt: 0,
  endAt: 0,
  startMs: 1000,
  endMs: 2000,
  labels: [],
  thumbKey: 'ag1',
  watchUrl: 'https://abema.tv',
};

describe('deriveLiveNow', () => {
  it('includes slots at start boundary and excludes end boundary', () => {
    expect(deriveLiveNow([base], 1000)[0].progressPercent).toBe(0);
    expect(deriveLiveNow([base], 2000)).toEqual([]);
  });

  it('calculates progress and sorts live slots', () => {
    const result = deriveLiveNow([
      { ...base, id: 'late', title: 'B', startMs: 1200, endMs: 2200 },
      { ...base, id: 'early', title: 'A' },
    ], 1500);

    expect(result.map((slot) => slot.id)).toEqual(['early', 'late']);
    expect(result[0].progressPercent).toBe(50);
  });
});
