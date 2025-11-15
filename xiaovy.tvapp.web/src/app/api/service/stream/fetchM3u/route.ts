import { NextResponse } from 'next/server';

export async function GET() {
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