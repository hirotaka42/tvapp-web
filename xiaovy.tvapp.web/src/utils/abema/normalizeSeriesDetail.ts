import {
  RawAbemaSeriesProgram,
  RawAbemaThumb,
  RawAbemaVideoSeason,
  RawAbemaVideoSeries,
} from '@/types/abema/rawApi';
import { AbemaSeriesDetail } from '@/types/abema/view';

function buildThumbnailUrl(thumb?: RawAbemaThumb): string | undefined {
  if (!thumb?.urlPrefix || !thumb.filename) {
    return undefined;
  }
  const base = `${thumb.urlPrefix}/${thumb.filename}`;
  return thumb.query ? `${base}?${thumb.query}` : base;
}

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
    thumbnailUrl: buildThumbnailUrl(program.thumbComponent),
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
    thumbnailUrl: buildThumbnailUrl(series.thumbComponent),
    seasons,
  };
}
