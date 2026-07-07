import { describe, expect, it } from 'vitest';
import { normalizeSlot, normalizeSlots } from './normalizeSlot';

describe('normalizeSlot', () => {
  it('normalizes timestamps and prefers share links', () => {
    const slot = normalizeSlot({
      id: 'slot-1',
      channelId: 'anime',
      title: 'Anime #1',
      startAt: 100,
      endAt: 200,
      labels: ['anime'],
      shares: { links: { abema: 'https://abema.go.link/example' } },
    });

    expect(slot).toMatchObject({
      id: 'slot-1',
      channelId: 'anime',
      startMs: 100000,
      endMs: 200000,
      labels: ['anime'],
      watchUrl: 'https://abema.go.link/example',
    });
    expect(slot?.thumbKey).toMatch(/^ag[1-9]$/);
  });

  it('builds fallback links and filters invalid slots', () => {
    const slots = normalizeSlots([
      { id: 'b', channelId: 'news', title: 'B', startAt: 20, endAt: 30 },
      { id: 'a', channelId: 'news', title: 'A', startAt: 10, endAt: 20 },
      { id: 'broken', title: 'missing channel', startAt: 10, endAt: 20 },
    ]);

    expect(slots.map((slot) => slot.id)).toEqual(['a', 'b']);
    expect(slots[0].watchUrl).toBe('https://abema.tv/channels/news/slots/a');
  });
});
