import { RawAbemaSlot } from '@/types/abema/rawApi';
import { AbemaSlot } from '@/types/abema/view';
import { thumbGradientClass } from './homeView/thumbGradientClass';

function pickWatchUrl(raw: RawAbemaSlot): string {
  const links = raw.shares?.links;
  const preferred = links?.['abema'] || links?.['link'] || links?.['twitter'] || links?.['facebook'];
  if (preferred) return preferred;

  const channelId = raw.channelId ? encodeURIComponent(raw.channelId) : 'unknown';
  const slotId = raw.id ? encodeURIComponent(raw.id) : 'unknown';
  return `https://abema.tv/channels/${channelId}/slots/${slotId}`;
}

export function normalizeSlot(raw: RawAbemaSlot): AbemaSlot | null {
  if (!raw.id || !raw.channelId || !raw.title || typeof raw.startAt !== 'number' || typeof raw.endAt !== 'number') {
    return null;
  }

  return {
    id: raw.id,
    channelId: raw.channelId,
    title: raw.title,
    startAt: raw.startAt,
    endAt: raw.endAt,
    startMs: raw.startAt * 1000,
    endMs: raw.endAt * 1000,
    content: raw.content,
    highlight: raw.highlight,
    detailHighlight: raw.detailHighlight,
    labels: Array.isArray(raw.labels) ? raw.labels : [],
    thumbKey: thumbGradientClass(raw.thumbnails?.default || raw.id),
    watchUrl: pickWatchUrl(raw),
    timeshiftEndAt: raw.timeshiftEndAt,
    timeshiftFreeEndAt: raw.timeshiftFreeEndAt,
  };
}

export function normalizeSlots(rawSlots: RawAbemaSlot[] = []): AbemaSlot[] {
  return rawSlots
    .map(normalizeSlot)
    .filter((slot): slot is AbemaSlot => slot !== null)
    .sort((left, right) => left.startMs - right.startMs);
}
