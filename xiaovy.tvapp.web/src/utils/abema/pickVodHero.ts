import { AbemaVodItem, AbemaVodShelf } from '@/types/abema/view';

export interface AbemaVodHeroPick {
  item: AbemaVodItem;
  shelfTitle: string;
  rank: number;
}

// Hero rotates among the top-N of these ranking shelves (matched by title keyword).
// User preference: pull from the general ranking and anime ranking (not the fixed live channel).
const HERO_SHELF_KEYWORDS = ['総合ランキング', 'アニメ'];

/** Top-N items of the hero-eligible shelves, as flat candidates with their rank. */
export function pickVodHeroCandidates(shelves: AbemaVodShelf[], topN = 3): AbemaVodHeroPick[] {
  const picks: AbemaVodHeroPick[] = [];
  for (const shelf of shelves) {
    if (!HERO_SHELF_KEYWORDS.some((keyword) => shelf.title.includes(keyword))) continue;
    shelf.items.slice(0, topN).forEach((item, index) => {
      picks.push({ item, shelfTitle: shelf.title, rank: index + 1 });
    });
  }
  return picks;
}

/** Pick one hero at random from the top-N of the eligible ranking shelves. */
export function pickVodHero(
  shelves: AbemaVodShelf[],
  rnd: () => number = Math.random,
  topN = 3,
): AbemaVodHeroPick | null {
  const candidates = pickVodHeroCandidates(shelves, topN);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(rnd() * candidates.length)] ?? null;
}

/**
 * Ordered set of hero slides for the auto-rotating carousel: the top-N of the
 * eligible ranking shelves, de-duplicated by contentId, shuffled, capped at `max`.
 */
export function orderVodHeroCarousel(
  shelves: AbemaVodShelf[],
  rnd: () => number = Math.random,
  topN = 5,
  max = 10,
): AbemaVodHeroPick[] {
  const seen = new Set<string>();
  const candidates = pickVodHeroCandidates(shelves, topN).filter((pick) => {
    if (seen.has(pick.item.contentId)) return false;
    seen.add(pick.item.contentId);
    return true;
  });
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, max);
}

/** Short badge label, e.g. "今日の総合ランキングTOP20" -> "総合ランキング". */
export function heroShelfLabel(shelfTitle: string): string {
  return shelfTitle
    .replace(/^今日の/, '')
    .replace(/TOP\s*\d+/i, '')
    .trim();
}
