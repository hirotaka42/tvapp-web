import { RawAbemaThumb } from '@/types/abema/rawApi';

const EPISODE_STILL_SIZE_QUERY = 'height=158&width=280&quality=75';

export function buildAbemaThumbnailUrl(thumb?: RawAbemaThumb): string | undefined {
  if (!thumb?.urlPrefix || !thumb.filename) {
    return undefined;
  }
  const base = `${thumb.urlPrefix}/${thumb.filename}`;
  return thumb.query ? `${base}?${thumb.query}` : base;
}

export function abemaEpisodeStillUrl(episodeId: string): string {
  return `https://image.p-c2-x.abema-tv.com/image/programs/${encodeURIComponent(
    episodeId,
  )}/thumb001.png?${EPISODE_STILL_SIZE_QUERY}`;
}
