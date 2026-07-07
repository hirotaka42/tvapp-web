import { describe, expect, it } from 'vitest';
import { AbemaSlot } from '@/types/abema/view';
import { deriveUpNext } from './deriveUpNext';

function slot(id: string, startMs: number): AbemaSlot {
  return {
    id,
    channelId: 'ch',
    title: id,
    startAt: startMs / 1000,
    endAt: startMs / 1000 + 100,
    startMs,
    endMs: startMs + 100000,
    labels: [],
    thumbKey: 'ag1',
    watchUrl: 'https://abema.tv',
  };
}

describe('deriveUpNext', () => {
  it('returns future slots in order with limit', () => {
    expect(deriveUpNext([slot('c', 3000), slot('a', 1000), slot('b', 2000)], 1000, 1).map((item) => item.id)).toEqual(['b']);
  });

  it('handles empty and zero limits', () => {
    expect(deriveUpNext([], 0)).toEqual([]);
    expect(deriveUpNext([slot('a', 1000)], 0, 0)).toEqual([]);
  });
});
