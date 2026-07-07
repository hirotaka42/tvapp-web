import {
  RawAbemaSeriesProgram,
  RawAbemaVideoSeason,
  RawAbemaVideoSeries,
} from '@/types/abema/rawApi';
import { AbemaSeriesDetail } from '@/types/abema/view';
import { abemaEpisodeStillUrl, buildAbemaThumbnailUrl } from './abemaImage';

function programOrder(program: RawAbemaSeriesProgram): number {
  return program.episode?.number ?? program.episode?.sequence ?? program.sequence ?? Number.MAX_SAFE_INTEGER;
}

function normalizeEpisode(program: RawAbemaSeriesProgram) {
  if (!program.id) {
    return null;
  }

  return {
    id: program.id,
    number: program.episode?.number,
    title: program.episode?.title,
    isFree: program.label?.free === true ? true : undefined,
    isPremium: program.label?.free !== true,
    thumbnailUrl: abemaEpisodeStillUrl(program.id),
  };
}

function getSeasons(series: RawAbemaVideoSeries): RawAbemaVideoSeason[] {
  const seasons = series.seasons ?? [];
  return seasons.length > 0 ? seasons : series.orderedSeasons ?? [];
}

export function normalizeSeriesDetail(
  series: RawAbemaVideoSeries,
  programs: RawAbemaSeriesProgram[],
): AbemaSeriesDetail | null {
  if (!series.id || !series.title) {
    return null;
  }

  const seasons = getSeasons(series)
    .filter((season): season is RawAbemaVideoSeason & { id: string; name: string } => Boolean(season.id && season.name))
    .map((season) => ({
      id: season.id,
      name: season.name,
      sequence: season.sequence,
      episodes: programs
        .filter((program) => program.season?.id === season.id)
        .slice()
        .sort((left, right) => programOrder(left) - programOrder(right))
        .map(normalizeEpisode)
        .filter((episode): episode is NonNullable<typeof episode> => episode !== null),
    }));

  return {
    id: series.id,
    title: series.title,
    description: series.content,
    genreName: series.genre?.name,
    thumbnailUrl: buildAbemaThumbnailUrl(series.thumbComponent),
    seasons,
  };
}
