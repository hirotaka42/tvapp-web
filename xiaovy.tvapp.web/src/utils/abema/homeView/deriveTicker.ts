import { AbemaLiveSlot, AbemaSlot, AbemaTickerItem } from '@/types/abema/view';
import { formatJstTime } from './formatJstTime';

export function deriveTicker(liveSlots: AbemaLiveSlot[], upNext: AbemaSlot[], limit = 8): AbemaTickerItem[] {
  const liveItems = liveSlots.map((slot) => ({
    id: `live-${slot.id}`,
    badge: 'LIVE',
    badgeVariant: 'live' as const,
    text: slot.title,
  }));
  const reserveItems = upNext.map((slot) => ({
    id: `next-${slot.id}`,
    badge: formatJstTime(slot.startMs),
    badgeVariant: 'reserve' as const,
    text: slot.title,
  }));

  return [...liveItems, ...reserveItems].slice(0, Math.max(0, limit));
}
