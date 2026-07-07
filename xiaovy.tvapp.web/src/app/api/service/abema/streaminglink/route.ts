import { NextRequest, NextResponse } from 'next/server';
import { createAbemaHlsProxyUrl } from '@/utils/abema/hlsRewrite';
import { putAbemaKeys } from '../keyStore';

export const dynamic = 'force-dynamic';

const AZURE_HOST = process.env.AZURE_FUNCTION_STREEAMING;
const AZURE_KEY = process.env.AZURE_FUNCTION_STREEAMING_CODE_KEY;

interface AzureStreamResponse {
  manifest_dict?: {
    urls?: string[];
  };
  video_url?: string;
  m3u8_urls?: string[];
  subtitles?: Array<{ lang?: string; url: string }>;
  keys?: Record<string, string>;
  key_dict?: Record<string, string>;
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const channelId = request.nextUrl.searchParams.get('channelId');
  const slotId = request.nextUrl.searchParams.get('slotId');

  if (type !== 'live' && type !== 'slot') {
    return NextResponse.json({ error: 'type must be live or slot.' }, { status: 400 });
  }

  if (type === 'live' && !channelId) {
    return NextResponse.json({ error: 'channelId is required for live playback.' }, { status: 400 });
  }

  if (type === 'slot' && !slotId) {
    return NextResponse.json({ error: 'slotId is required for slot playback.' }, { status: 400 });
  }

  try {
    const sourceUrl = type === 'live'
      ? `https://abema.tv/now-on-air/${encodeURIComponent(channelId ?? '')}`
      : `https://abema.tv/video/episode/${encodeURIComponent(slotId ?? '')}`;

    if (AZURE_HOST) {
      return await resolveViaAzure(sourceUrl);
    }

    if (type === 'live') {
      const manifestUrl = `https://linear-abematv.akamaized.net/channel/${encodeURIComponent(channelId ?? '')}/1080/playlist.m3u8`;
      return NextResponse.json({
        video_url: createAbemaHlsProxyUrl(manifestUrl),
        m3u8_urls: [manifestUrl],
        subtitles: [],
      });
    }

    return NextResponse.json(
      {
        error:
          'ABEMA slot playback requires the JP-egress resolver because media token acquisition is required.',
      },
      { status: 501 },
    );
  } catch (error) {
    console.error('ABEMA stream resolve error:', error);
    return NextResponse.json({ error: 'ABEMA stream resolve failed.' }, { status: 502 });
  }
}

async function resolveViaAzure(sourceUrl: string) {
  const url =
    `${AZURE_HOST}/api/backend_stream_url_http` +
    `?code=${encodeURIComponent(AZURE_KEY ?? '')}` +
    `&url=${encodeURIComponent(sourceUrl)}` +
    `&service_id=2&res_type=6`;

  const response = await fetch(url, {
    headers: {
      Origin: 'https://abema.tv',
      Referer: 'https://abema.tv/',
      'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'ABEMA stream resolve via Azure failed.' }, { status: response.status });
  }

  const data = (await response.json()) as AzureStreamResponse;
  const urls = data.manifest_dict?.urls ?? data.m3u8_urls ?? (data.video_url ? [data.video_url] : []);
  const firstUrl = urls[0];
  const keys = data.keys ?? data.key_dict;
  const sessionId = keys ? crypto.randomUUID() : undefined;

  if (!firstUrl) {
    return NextResponse.json({ error: 'Playable ABEMA manifest was not found.' }, { status: 404 });
  }

  if (sessionId && keys) {
    putAbemaKeys(sessionId, keys);
  }

  return NextResponse.json({
    video_url: firstUrl.startsWith('/api/') ? firstUrl : createAbemaHlsProxyUrl(firstUrl, sessionId),
    m3u8_urls: urls,
    subtitles: data.subtitles ?? [],
  });
}
