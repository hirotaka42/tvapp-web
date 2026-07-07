import { NextRequest, NextResponse } from 'next/server';
import { getMovieDb, jsonError, readRanking } from '@/app/api/service/cinema/_shared';
import { jstToday } from '@/utils/cinema/status';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'now';

  if (type !== 'now' && type !== 'expected') {
    return NextResponse.json({ error: 'type must be now or expected' }, { status: 400 });
  }

  try {
    const db = getMovieDb();
    const ranking = await readRanking(db, type, jstToday());
    return NextResponse.json({ ranking }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    return NextResponse.json(jsonError(error), { status: 500 });
  }
}
