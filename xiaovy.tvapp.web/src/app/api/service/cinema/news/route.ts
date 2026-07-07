import { NextRequest, NextResponse } from 'next/server';
import { getMovieDb, jsonError, readNews } from '@/app/api/service/cinema/_shared';

const VALID_CATEGORIES = new Set([
  'release_date',
  'cast',
  'trailer',
  'poster',
  'festival',
  'sequel',
  'revival',
  'stage_greeting',
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (category && !VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: 'category is not supported' }, { status: 400 });
  }

  try {
    const db = getMovieDb();
    const news = await readNews(db, category);
    return NextResponse.json({ news }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=300' },
    });
  } catch (error) {
    return NextResponse.json(jsonError(error), { status: 500 });
  }
}
