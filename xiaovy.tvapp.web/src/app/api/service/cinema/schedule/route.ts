import { NextRequest, NextResponse } from 'next/server';
import { getMovieDb, isValidMonth, jsonError, readScheduleMonth } from '@/app/api/service/cinema/_shared';
import { jstToday } from '@/utils/cinema/status';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');

  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'month must be YYYY-MM' }, { status: 400 });
  }

  try {
    const db = getMovieDb();
    const schedule = await readScheduleMonth(db, month, jstToday());
    return NextResponse.json(schedule, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    return NextResponse.json(jsonError(error), { status: 500 });
  }
}
