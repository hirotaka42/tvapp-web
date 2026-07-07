import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { deriveExpiryLabel } from './deriveExpiryLabel';
import { TickerItem } from './types';

export function deriveTickerItems(
  contents: ConvertedContent[] | null | undefined,
  now = Date.now(),
  limit = 7,
): TickerItem[] {
  if (!contents?.length || limit <= 0) return [];

  const items: TickerItem[] = [];

  for (const content of contents.slice(0, limit)) {
    const expiry = deriveExpiryLabel(content.endAt, now);
    if (expiry?.startsWith('本日')) {
      items.push({
        id: `${content.id}-ending`,
        label: 'まもなく終了',
        text: `${content.seriesTitle || content.title} - ${expiry}`,
        variant: 'ending',
      });
    } else {
      const label = content.rank && content.rank <= 3 ? '急上昇' : '新着';
      items.push({
        id: content.id,
        label,
        text: content.seriesTitle || content.title,
        variant: label === '急上昇' ? 'trend' : 'new',
      });
    }
  }

  return items.slice(0, limit);
}
