import { AbemaLiveSlot, AbemaSlot } from '@/types/abema/view';

export function deriveLiveNow(slots: AbemaSlot[], now: number): AbemaLiveSlot[] {
  return slots
    .filter((slot) => slot.startMs <= now && now < slot.endMs)
    .map((slot) => ({
      ...slot,
      progressPercent: Math.min(100, Math.max(0, ((now - slot.startMs) / (slot.endMs - slot.startMs)) * 100)),
    }))
    .sort((left, right) => left.startMs - right.startMs || left.title.localeCompare(right.title));
}
