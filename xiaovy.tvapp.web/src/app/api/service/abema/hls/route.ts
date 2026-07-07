import { NextRequest, NextResponse } from 'next/server';
import {
  contentTypeForAbemaUrl,
  isAbemaM3u8Resource,
  isAllowedAbemaHlsUrl,
  rewriteAbemaM3u8,
} from '@/utils/abema/hlsRewrite';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, If-Range, If-None-Match, If-Modified-Since',
};

const FORWARDED_REQUEST_HEADERS = ['range', 'if-range', 'if-none-match', 'if-modified-since'] as const;
const COPIED_RESPONSE_HEADERS = [
  'accept-ranges',
  'cache-control',
  'content-length',
  'content-range',
  'etag',
  'last-modified',
] as const;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function HEAD(request: NextRequest) {
  return handle(request, true);
}

export async function GET(request: NextRequest) {
  return handle(request, false);
}

async function handle(request: NextRequest, headOnly: boolean) {
  const sourceUrl = request.nextUrl.searchParams.get('src');
  const sessionId = request.nextUrl.searchParams.get('sid') ?? undefined;

  if (!sourceUrl) {
    return NextResponse.json({ error: 'src query parameter is required.' }, { status: 400, headers: CORS_HEADERS });
  }

  if (!isAllowedAbemaHlsUrl(sourceUrl)) {
    return NextResponse.json({ error: 'URL is not allowed.' }, { status: 403, headers: CORS_HEADERS });
  }

  const upstreamHeaders = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) upstreamHeaders.set(name, value);
  }

  try {
    const upstream = await fetch(sourceUrl, {
      method: headOnly ? 'HEAD' : 'GET',
      headers: upstreamHeaders,
      cache: 'no-store',
    });
    const contentType = contentTypeForAbemaUrl(sourceUrl, upstream.headers.get('content-type'));
    const headers = responseHeaders(upstream.headers, contentType);

    if (!headOnly && isAbemaM3u8Resource(sourceUrl, contentType)) {
      headers.delete('content-length');
      const text = await upstream.text();
      return new NextResponse(rewriteAbemaM3u8(text, sourceUrl, { sessionId }), {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      });
    }

    return new NextResponse(headOnly ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (error) {
    console.error('abema hls proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch ABEMA HLS resource.' }, { status: 502, headers: CORS_HEADERS });
  }
}

function responseHeaders(upstreamHeaders: Headers, contentType: string): Headers {
  const headers = new Headers(CORS_HEADERS);
  headers.set('Content-Type', contentType);

  for (const name of COPIED_RESPONSE_HEADERS) {
    const value = upstreamHeaders.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
}
