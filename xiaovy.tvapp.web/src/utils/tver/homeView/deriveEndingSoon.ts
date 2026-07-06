import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { deriveExpiryLabel } from './deriveExpiryLabel';

export function deriveEndingSoon(
  allContents: Record<string, ConvertedContent[]> | ConvertedContent[][] | null | undefined,
  now = Date.now(),
  limit = 4,
): ConvertedContent[] {
  if (!allContents || limit <= 0) return [];

  const rows = Array.isArray(allContents) ? allContents.flat() : Object.values(allContents).flat();
  const seen = new Set<string>();
  const ending: ConvertedContent[] = [];

  for (const content of rows) {
    if (seen.has(content.id)) continue;
    const label = deriveExpiryLabel(content.endAt, now);
    if (!label?.startsWith('本日')) continue;

    seen.add(content.id);
    ending.push(content);
    if (ending.length >= limit) break;
  }

  return ending;
}
