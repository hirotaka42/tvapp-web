import { AbemaSlot } from '@/types/abema/view';

export type AbemaPlaybackKind = 'live' | 'watch';

export interface AbemaPlaybackTarget {
  kind: AbemaPlaybackKind;
  id: string;
}

export function abemaPlaybackPath(target: AbemaPlaybackTarget): string {
  return `/service/abema/${target.kind}/${encodeURIComponent(target.id)}`;
}

export function abemaSlotPlaybackTarget(slot: Pick<AbemaSlot, 'id' | 'channelId' | 'startMs' | 'endMs'>, now = Date.now()): AbemaPlaybackTarget {
  if (slot.startMs <= now && now < slot.endMs) {
    return { kind: 'live', id: slot.channelId };
  }

  return { kind: 'watch', id: slot.id };
}

export function abemaSlotPlaybackPath(slot: Pick<AbemaSlot, 'id' | 'channelId' | 'startMs' | 'endMs'>, now = Date.now()): string {
  return abemaPlaybackPath(abemaSlotPlaybackTarget(slot, now));
}

export function externalAbemaWatchUrl(target: AbemaPlaybackTarget): string {
  if (target.kind === 'live') {
    return `https://abema.tv/now-on-air/${encodeURIComponent(target.id)}`;
  }

  return `https://abema.tv/video/episode/${encodeURIComponent(target.id)}`;
}
