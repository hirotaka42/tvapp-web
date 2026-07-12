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
  const today = jstToday();
  const date = searchParams.get('date') || today;

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
    const normalizedSlots = normalizeSlots(raw.slots);
    const cutoffMs = Date.now() - 2 * 60 * 60 * 1000;
    // 当日分だけ、番組表の表示窓に 60 分の安全マージンを加えて古い過去枠を除外する。
    const slots = date === today
      ? normalizedSlots.filter((slot) => slot.endMs > cutoffMs)
      : normalizedSlots;

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
