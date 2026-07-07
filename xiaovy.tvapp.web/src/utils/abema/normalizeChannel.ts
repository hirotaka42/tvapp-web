import { RawAbemaChannel } from '@/types/abema/rawApi';
import { AbemaChannel } from '@/types/abema/view';

export function normalizeChannel(raw: RawAbemaChannel): AbemaChannel | null {
  if (!raw.id || !raw.name) return null;

  return {
    id: raw.id,
    name: raw.name,
    gnid: raw.gnid,
    hls: raw.playback?.hls,
    dash: raw.playback?.dash,
    watchUrl: `https://abema.tv/now-on-air/${encodeURIComponent(raw.id)}`,
  };
}

export function normalizeChannels(rawChannels: RawAbemaChannel[] = []): AbemaChannel[] {
  return rawChannels
    .map(normalizeChannel)
    .filter((channel): channel is AbemaChannel => channel !== null);
}
