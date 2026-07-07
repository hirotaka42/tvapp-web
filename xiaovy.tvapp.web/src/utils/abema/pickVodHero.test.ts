import { describe, it, expect } from 'vitest';
import { pickVodHero, pickVodHeroCandidates, heroShelfLabel, orderVodHeroCarousel } from './pickVodHero';
import { AbemaVodShelf } from '@/types/abema/view';

function shelf(title: string, ids: string[]): AbemaVodShelf {
  return {
    key: title,
    title,
    items: ids.map((id) => ({ contentId: id, contentType: 'CONTENT_TYPE_SERIES', title: id })),
  };
}

const shelves = [
  shelf('今日の総合ランキングTOP20', ['a', 'b', 'c', 'd']),
  shelf('アニメランキング', ['e', 'f', 'g']),
  shelf('バラエティランキング', ['x', 'y', 'z']),
];

describe('pickVodHeroCandidates', () => {
  it('collects only top-3 of the general + anime ranking shelves', () => {
    expect(pickVodHeroCandidates(shelves).map((p) => p.item.contentId)).toEqual([
      'a', 'b', 'c', 'e', 'f', 'g',
    ]);
  });

  it('excludes non-eligible shelves (e.g. variety)', () => {
    const ids = pickVodHeroCandidates(shelves).map((p) => p.item.contentId);
    expect(ids).not.toContain('x');
  });

  it('tags rank per shelf', () => {
    const first = pickVodHeroCandidates(shelves)[0];
    expect(first.rank).toBe(1);
    expect(first.shelfTitle).toContain('総合ランキング');
  });
});

describe('pickVodHero', () => {
  it('picks deterministically with an injected rng', () => {
    expect(pickVodHero(shelves, () => 0)?.item.contentId).toBe('a');
    expect(pickVodHero(shelves, () => 0.999)?.item.contentId).toBe('g');
  });

  it('returns null when there are no eligible shelves', () => {
    expect(pickVodHero([shelf('バラエティランキング', ['x'])])).toBeNull();
  });
});

describe('orderVodHeroCarousel', () => {
  it('returns the eligible candidates (deduped) capped at max', () => {
    const out = orderVodHeroCarousel(shelves, () => 0, 5, 10);
    // general has a,b,c,d (top5 -> a,b,c,d) + anime e,f,g = 7 unique
    expect(out).toHaveLength(7);
    expect(new Set(out.map((p) => p.item.contentId)).size).toBe(7);
  });

  it('caps at max', () => {
    expect(orderVodHeroCarousel(shelves, () => 0, 5, 3)).toHaveLength(3);
  });

  it('is empty when no eligible shelves', () => {
    expect(orderVodHeroCarousel([shelf('バラエティランキング', ['x'])])).toEqual([]);
  });
});

describe('heroShelfLabel', () => {
  it('strips 今日の prefix and TOPnn suffix', () => {
    expect(heroShelfLabel('今日の総合ランキングTOP20')).toBe('総合ランキング');
    expect(heroShelfLabel('アニメランキング')).toBe('アニメランキング');
  });
});
