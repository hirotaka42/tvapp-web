import { RawAbemaVideoProgram } from '@/types/abema/rawApi';
import { AbemaProgramInfo } from '@/types/abema/view';
import { abemaEpisodeStillUrl, buildAbemaThumbnailUrl } from './abemaImage';

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
    thumbnailUrl: raw.id ? abemaEpisodeStillUrl(raw.id) : buildAbemaThumbnailUrl(raw.series?.thumbComponent),
    genreName: raw.genre?.name,
    isFree: raw.label?.free === true ? true : undefined,
    isPremium: raw.label?.free !== true,
  };
}
