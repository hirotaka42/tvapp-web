import { NextResponse } from 'next/server';
import { fetchWithAbemaUserToken } from '@/lib/abema/auth';
import { RawAbemaVideoGenresResponse } from '@/types/abema/rawApi';

const ABEMA_VIDEO_GENRES_URL = 'https://api.abema.io/v1/video/genres';

export async function GET() {
  try {
    const response = await fetchWithAbemaUserToken(ABEMA_VIDEO_GENRES_URL, {
      headers: {
        Origin: 'https://abema.tv',
        Referer: 'https://abema.tv/',
        'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'ABEMA video genres fetch failed' }, { status: response.status });
    }

    const raw = await response.json() as RawAbemaVideoGenresResponse;
    const genres = (raw.genres ?? [])
      .filter((genre) => genre.id && genre.name)
      .map((genre) => ({ id: genre.id as string, name: genre.name as string }));

    return NextResponse.json(
      { genres },
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=3600' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
