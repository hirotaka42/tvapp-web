import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAbemaUserToken } from '@/lib/abema/auth';
import { RawAbemaVideoProgram } from '@/types/abema/rawApi';
import { normalizeProgram } from '@/utils/abema/normalizeProgram';

const ABEMA_VIDEO_PROGRAMS_URL = 'https://api.abema.io/v1/video/programs';
const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';

const ABEMA_HEADERS = {
  Origin: 'https://abema.tv',
  Referer: 'https://abema.tv/',
  'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const response = await fetchWithAbemaUserToken(
      `${ABEMA_VIDEO_PROGRAMS_URL}/${encodeURIComponent(id)}`,
      {
        headers: ABEMA_HEADERS,
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'ABEMA video program fetch failed' }, { status: response.status });
    }

    const raw = await response.json() as RawAbemaVideoProgram;
    const program = normalizeProgram(raw);
    if (!program) {
      return NextResponse.json({ error: 'ABEMA video program not found' }, { status: 404 });
    }

    return NextResponse.json(program, { headers: { 'Cache-Control': CACHE_CONTROL } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
