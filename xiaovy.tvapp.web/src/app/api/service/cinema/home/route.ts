import { NextResponse } from 'next/server';
import { getMovieDb, jsonError, readHome } from '@/app/api/service/cinema/_shared';
import { jstToday } from '@/utils/cinema/status';

export async function GET() {
  try {
    const db = getMovieDb();
    const data = await readHome(db, jstToday());
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    return NextResponse.json(jsonError(error), { status: 500 });
  }
}
