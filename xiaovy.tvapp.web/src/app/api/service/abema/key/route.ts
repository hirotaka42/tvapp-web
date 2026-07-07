import { NextRequest, NextResponse } from 'next/server';
import { getAbemaKey } from '../keyStore';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, If-Range, If-None-Match, If-Modified-Since',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get('ticket');
  const sessionId = request.nextUrl.searchParams.get('sid');

  if (!ticket) {
    return NextResponse.json({ error: 'ticket query parameter is required.' }, { status: 400, headers: CORS_HEADERS });
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'sid query parameter is required.' }, { status: 400, headers: CORS_HEADERS });
  }

  const key = getAbemaKey(sessionId, ticket);
  if (!key) {
    return NextResponse.json(
      {
        error:
          'ABEMA key is not available for this session. Configure a resolver that returns derived AES keys or a browser-playable manifest.',
      },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'private, max-age=600',
    },
  });
}
