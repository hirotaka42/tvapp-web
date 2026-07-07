import { NextRequest, NextResponse } from 'next/server';
import { RawAbemaSlotsResponse } from '@/types/abema/rawApi';
import { normalizeSlots } from '@/utils/abema/normalizeSlot';

function jstToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || jstToday();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.abema.io/v1/broadcast/slots?dateFrom=${encodeURIComponent(date)}`, {
      headers: {
        Origin: 'https://abema.tv',
        Referer: 'https://abema.tv/',
        'User-Agent': 'Mozilla/5.0 TVapp ABEMA Browser',
      },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'ABEMA slots fetch failed' }, { status: response.status });
    }

    const raw = await response.json() as RawAbemaSlotsResponse;
    const slots = normalizeSlots(raw.slots);

    return NextResponse.json(
      { date, slots },
      { headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=60' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
