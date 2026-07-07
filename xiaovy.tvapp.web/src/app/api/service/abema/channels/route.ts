import { NextResponse } from 'next/server';
import { RawAbemaChannelsResponse } from '@/types/abema/rawApi';
import { normalizeChannels } from '@/utils/abema/normalizeChannel';

const ABEMA_CHANNELS_URL = 'https://api.abema.io/v1/channels';

export async function GET() {
  try {
    const response = await fetch(ABEMA_CHANNELS_URL, {
      headers: {
        Origin: 'https://abema.tv',
        Referer: 'https://abema.tv/',
        'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
      },
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'ABEMA channels fetch failed' }, { status: response.status });
    }

    const raw = await response.json() as RawAbemaChannelsResponse;
    const channels = normalizeChannels(raw.channels);

    return NextResponse.json(
      { channels },
      { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=300' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
