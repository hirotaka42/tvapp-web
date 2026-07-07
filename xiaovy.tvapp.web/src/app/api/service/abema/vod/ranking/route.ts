import { NextResponse } from 'next/server';
import { fetchWithAbemaUserToken } from '@/lib/abema/auth';
import { RawAbemaModulesResponse } from '@/types/abema/rawApi';
import { normalizeVod } from '@/utils/abema/normalizeVod';

const ABEMA_VOD_RANKING_URL =
  'https://user-content-api.p-c3-e.abema-tv.com/v1/modules?spotId=xRKNUGRQ&spotVersion=1&limit=8&qos=PC&qpl=web';

export async function GET() {
  try {
    const response = await fetchWithAbemaUserToken(ABEMA_VOD_RANKING_URL, {
      headers: {
        Origin: 'https://abema.tv',
        Referer: 'https://abema.tv/',
        'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'ABEMA VOD ranking fetch failed' }, { status: response.status });
    }

    const raw = await response.json() as RawAbemaModulesResponse;
    const shelves = normalizeVod(raw);

    return NextResponse.json(
      { shelves },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
