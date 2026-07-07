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

type StreamResolveFailureReason =
  | 'premium'
  | 'geo'
  | 'upstream'
  | 'not_found'
  | 'resolver_unavailable'
  | 'unknown';

function classifyStreamResolveFailure(input: {
  status?: number;
  message?: string;
  resolverUnavailable?: boolean;
}): StreamResolveFailureReason {
  const message = input.message?.toLowerCase() ?? '';

  if (message.includes('premium') || message.includes('member')) {
    return 'premium';
  }

  if (message.includes('region') || message.includes('geo') || message.includes('id124')) {
    return 'geo';
  }

  if (input.resolverUnavailable) {
    return 'resolver_unavailable';
  }

  if (input.status === 404) {
    return 'not_found';
  }

  if (input.status || message) {
    return 'upstream';
  }

  return 'unknown';
}

function failureResponse(error: string, status: number, reason: StreamResolveFailureReason) {
  return NextResponse.json({ error, reason }, { status });
}

function parseAzureStreamResponse(text: string): AzureStreamResponse {
  if (!text) {
    return {};
  }
  return JSON.parse(text) as AzureStreamResponse;
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const channelId = request.nextUrl.searchParams.get('channelId');
  const slotId = request.nextUrl.searchParams.get('slotId');

  if (type !== 'live' && type !== 'slot') {
    return failureResponse('type must be live or slot.', 400, 'unknown');
  }

  if (type === 'live' && !channelId) {
    return failureResponse('channelId is required for live playback.', 400, 'unknown');
  }

  if (type === 'slot' && !slotId) {
    return failureResponse('slotId is required for slot playback.', 400, 'unknown');
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
        reason: 'resolver_unavailable',
      },
      { status: 501 },
    );
  } catch (error) {
    console.error('ABEMA stream resolve error:', error);
    return failureResponse(
      'ABEMA stream resolve failed.',
      502,
      classifyStreamResolveFailure({
        message: error instanceof Error ? error.message : undefined,
      }),
    );
  }
}

async function resolveViaAzure(sourceUrl: string) {
  const url =
    `${AZURE_HOST}/api/backend_stream_url_http` +
    `?code=${encodeURIComponent(AZURE_KEY ?? '')}` +
    `&url=${encodeURIComponent(sourceUrl)}` +
    `&service_id=2&res_type=6`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Origin: 'https://abema.tv',
        Referer: 'https://abema.tv/',
        'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
      },
      cache: 'no-store',
    });
  } catch (error) {
    return failureResponse(
      'ABEMA stream resolve via Azure failed.',
      502,
      classifyStreamResolveFailure({
        message: error instanceof Error ? error.message : undefined,
        resolverUnavailable: true,
      }),
    );
  }

  const responseText = await response.text();

  if (!response.ok) {
    return failureResponse(
      'ABEMA stream resolve via Azure failed.',
      response.status,
      classifyStreamResolveFailure({
        status: response.status,
        message: responseText,
      }),
    );
  }

  let data: AzureStreamResponse;
  try {
    data = parseAzureStreamResponse(responseText);
  } catch (error) {
    return failureResponse(
      'ABEMA stream resolve via Azure failed.',
      502,
      classifyStreamResolveFailure({
        message: `${responseText} ${error instanceof Error ? error.message : ''}`,
      }),
    );
  }

  const urls = data.manifest_dict?.urls ?? data.m3u8_urls ?? (data.video_url ? [data.video_url] : []);
  const firstUrl = urls[0];
  const keys = data.keys ?? data.key_dict;
  const sessionId = keys ? crypto.randomUUID() : undefined;

  if (!firstUrl) {
    return failureResponse(
      'Playable ABEMA manifest was not found.',
      404,
      classifyStreamResolveFailure({
        status: 404,
        message: responseText,
      }),
    );
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
