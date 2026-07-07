import { NextResponse } from 'next/server';

// ライブ配信(m3u プレイリスト)取得。TVER 本流とは別機能で、環境変数が未設定でも
// ビルド(静的生成)を壊さないよう動的化し、URL 未設定時は 503 を返す。
export const dynamic = 'force-dynamic';

export async function GET() {
  const m3uUrl = process.env.NEXT_PUBLIC_JP_STREAMING_M3U_URL || '';
  if (!m3uUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_JP_STREAMING_M3U_URL が未設定です。' },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(m3uUrl);
    const text = await res.text();
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'プレイリストの取得に失敗しました。' }, { status: 502 });
  }
}
