import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAbemaUserToken } from '@/lib/abema/auth';
import { RawAbemaSeriesProgram, RawAbemaSeriesPrograms, RawAbemaVideoSeries } from '@/types/abema/rawApi';

const ABEMA_VIDEO_SERIES_URL = 'https://api.abema.io/v1/video/series';

interface ResolvedContentId {
  seriesId: string;
}

function resolveContentId(contentId: string, contentType: string): ResolvedContentId | null {
  if (contentType === 'CONTENT_TYPE_SERIES') {
    return { seriesId: contentId };
  }

  if (contentType === 'CONTENT_TYPE_SEASON') {
    const match = contentId.match(/^(.+)_(s[^_]+)$/);
    if (!match) {
      return null;
    }
    return { seriesId: match[1] };
  }

  return null;
}

function pickProgram(programs: RawAbemaSeriesProgram[], contentId: string): RawAbemaSeriesProgram | undefined {
  const contentPrefix = `${contentId}_`;
  return programs.find((program) => program.id?.startsWith(contentPrefix) && program.label?.free === true)
    ?? programs.find((program) => program.id?.startsWith(contentPrefix))
    ?? programs.find((program) => program.label?.free === true)
    ?? programs[0];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get('contentId');
  const contentType = searchParams.get('contentType');

  if (!contentId || !contentType) {
    return NextResponse.json({ error: 'contentId and contentType are required' }, { status: 400 });
  }

  const resolved = resolveContentId(contentId, contentType);
  if (!resolved) {
    return NextResponse.json({ error: 'Unsupported ABEMA content type' }, { status: 400 });
  }

  try {
    const seriesResponse = await fetchWithAbemaUserToken(
      `${ABEMA_VIDEO_SERIES_URL}/${encodeURIComponent(resolved.seriesId)}`,
      {
        headers: {
          Origin: 'https://abema.tv',
          Referer: 'https://abema.tv/',
          'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
        },
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

    const programsUrl = new URL(`${ABEMA_VIDEO_SERIES_URL}/${encodeURIComponent(resolved.seriesId)}/programs`);
    programsUrl.searchParams.set('seriesVersion', String(series.version));
    programsUrl.searchParams.set('order', 'seq');
    programsUrl.searchParams.set('limit', '8');

    const programsResponse = await fetchWithAbemaUserToken(programsUrl, {
      headers: {
        Origin: 'https://abema.tv',
        Referer: 'https://abema.tv/',
        'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
      },
      next: { revalidate: 300 },
    });

    if (!programsResponse.ok) {
      return NextResponse.json({ error: 'ABEMA series programs fetch failed' }, { status: programsResponse.status });
    }

    const rawPrograms = await programsResponse.json() as RawAbemaSeriesPrograms;
    const program = pickProgram(rawPrograms.programs ?? [], contentId);
    if (!program?.id) {
      return NextResponse.json({ error: 'ABEMA episode not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        episodeId: program.id,
        title: program.episode?.title,
        seriesTitle: series.title,
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
