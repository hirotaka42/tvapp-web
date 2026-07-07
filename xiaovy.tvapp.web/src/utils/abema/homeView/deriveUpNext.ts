import { AbemaSlot } from '@/types/abema/view';

export function deriveUpNext(slots: AbemaSlot[], now: number, limit = 5): AbemaSlot[] {
  return slots
    .filter((slot) => slot.startMs > now)
    .sort((left, right) => left.startMs - right.startMs || left.title.localeCompare(right.title))
    .slice(0, Math.max(0, limit));
}
