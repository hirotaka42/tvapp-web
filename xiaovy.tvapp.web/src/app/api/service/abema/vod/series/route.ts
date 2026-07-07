import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAbemaUserToken } from '@/lib/abema/auth';
import {
  RawAbemaSeriesProgram,
  RawAbemaSeriesPrograms,
  RawAbemaVideoSeason,
  RawAbemaVideoSeries,
} from '@/types/abema/rawApi';
import { normalizeSeriesDetail } from '@/utils/abema/normalizeSeriesDetail';

const ABEMA_VIDEO_SERIES_URL = 'https://api.abema.io/v1/video/series';
const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';
const PROGRAMS_PAGE_LIMIT = 100;
const PROGRAMS_MAX_COUNT = 300;

const ABEMA_HEADERS = {
  Origin: 'https://abema.tv',
  Referer: 'https://abema.tv/',
  'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
};

function getSeasons(series: RawAbemaVideoSeries): RawAbemaVideoSeason[] {
  const seasons = series.seasons ?? [];
  return seasons.length > 0 ? seasons : series.orderedSeasons ?? [];
}

async function fetchSeasonPrograms(
  seriesId: string,
  version: string | number,
  seasonId: string,
): Promise<RawAbemaSeriesProgram[]> {
  const programs: RawAbemaSeriesProgram[] = [];

  for (let offset = 0; offset < PROGRAMS_MAX_COUNT; offset += PROGRAMS_PAGE_LIMIT) {
    const programsUrl = new URL(`${ABEMA_VIDEO_SERIES_URL}/${encodeURIComponent(seriesId)}/programs`);
    programsUrl.searchParams.set('seriesVersion', String(version));
    programsUrl.searchParams.set('order', 'seq');
    programsUrl.searchParams.set('seasonId', seasonId);
    programsUrl.searchParams.set('limit', String(PROGRAMS_PAGE_LIMIT));
    programsUrl.searchParams.set('offset', String(offset));

    const response = await fetchWithAbemaUserToken(programsUrl, {
      headers: ABEMA_HEADERS,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`ABEMA series programs fetch failed: ${response.status}`);
    }

    const raw = await response.json() as RawAbemaSeriesPrograms;
    const pagePrograms = raw.programs ?? [];
    programs.push(...pagePrograms);

    if (pagePrograms.length < PROGRAMS_PAGE_LIMIT) {
      break;
    }
  }

  return programs;
}

async function fetchSeriesProgramsBySeason(
  seriesId: string,
  version: string | number,
  seasons: RawAbemaVideoSeason[],
): Promise<RawAbemaSeriesProgram[]> {
  const programsBySeason = await Promise.all(
    seasons
      .filter((season): season is RawAbemaVideoSeason & { id: string } => Boolean(season.id))
      .map((season) => fetchSeasonPrograms(seriesId, version, season.id)),
  );

  return programsBySeason.flat();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const seriesResponse = await fetchWithAbemaUserToken(
      `${ABEMA_VIDEO_SERIES_URL}/${encodeURIComponent(id)}`,
      {
        headers: ABEMA_HEADERS,
        next: { revalidate: 300 },
      },
    );

    if (!seriesResponse.ok) {
      return NextResponse.json({ error: 'ABEMA video series fetch failed' }, { status: seriesResponse.status });
    }

    const series = await seriesResponse.json() as RawAbemaVideoSeries;
    if (series.version === undefined || series.version === null) {
      return NextResponse.json({ error: 'ABEMA video series version not found' }, { status: 404 });
    }

    const programs = await fetchSeriesProgramsBySeason(id, series.version, getSeasons(series));
    const detail = normalizeSeriesDetail(series, programs);
    if (!detail) {
      return NextResponse.json({ error: 'ABEMA video series not found' }, { status: 404 });
    }

    return NextResponse.json(detail, { headers: { 'Cache-Control': CACHE_CONTROL } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
