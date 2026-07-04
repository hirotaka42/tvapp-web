import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const m3uUrl = process.env.NEXT_PUBLIC_JP_STREAMING_M3U_URL || '';
  const res = await fetch(m3uUrl);
  const text = await res.text();

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    },
  });
}