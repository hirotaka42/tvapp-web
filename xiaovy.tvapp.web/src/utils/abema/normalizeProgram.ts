import { RawAbemaThumb, RawAbemaVideoProgram } from '@/types/abema/rawApi';
import { AbemaProgramInfo } from '@/types/abema/view';

function buildThumbnailUrl(thumb?: RawAbemaThumb): string | undefined {
  if (!thumb?.urlPrefix || !thumb.filename) {
    return undefined;
  }
  const base = `${thumb.urlPrefix}/${thumb.filename}`;
  return thumb.query ? `${base}?${thumb.query}` : base;
}

export function normalizeProgram(raw: RawAbemaVideoProgram): AbemaProgramInfo | null {
  if (!raw.id) {
    return null;
  }

  return {
    id: raw.id,
    seriesId: raw.series?.id,
    seriesTitle: raw.series?.title,
    seasonId: raw.season?.id,
    seasonName: raw.season?.name,
    seasonSequence: raw.season?.sequence,
    episodeNumber: raw.episode?.number,
    episodeTitle: raw.episode?.title,
    description: raw.episode?.content,
    thumbnailUrl: buildThumbnailUrl(raw.series?.thumbComponent) ?? buildThumbnailUrl(raw.thumbComponent),
    genreName: raw.genre?.name,
    isFree: raw.label?.free === true ? true : undefined,
  };
}
