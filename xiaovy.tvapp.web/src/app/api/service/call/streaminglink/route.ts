import { NextRequest, NextResponse } from 'next/server';
import {
  resolveEpisodeStream,
  TverGeoRestrictedError,
  TverStreamNotFoundError,
  TverApiKeyError,
  TverResolveError,
} from '@/lib/tver/streamResolver';
import { getStreaksInfoCached } from '@/lib/tver/streaksInfoCache';

// GET /api/service/call/streaminglink?episodeId=xxxx
//
// 以前は Azure Functions(yt-dlp)へ委譲していたが、TVER→Streaks の解決を純 TS で
// 完結させ、Cloudflare Workers/Firebase だけでほぼ $0 運用できるようにした。
// 後方互換のため { video_url } を返しつつ、字幕やタイトルも併せて返す。
//
// Response: { video_url: string, m3u8_urls: string[], subtitles: {lang,url}[], title?, duration? }
export async function GET(request: NextRequest) {
  const episodeId = new URL(request.url).searchParams.get('episodeId');

  if (!episodeId || episodeId.trim() === '') {
    return NextResponse.json({ error: 'episodeId が必須です。' }, { status: 400 });
  }

  try {
    const streaksInfo = await getStreaksInfoCached();
    const stream = await resolveEpisodeStream(episodeId, { streaksInfo });

    return NextResponse.json({
      video_url: stream.videoUrl,
      m3u8_urls: stream.m3u8Urls,
      subtitles: stream.subtitles,
      title: stream.title,
      duration: stream.duration,
    });
  } catch (error) {
    if (error instanceof TverGeoRestrictedError) {
      // 451: 地域制限(日本国外)の事実を示す
      return NextResponse.json({ error: error.message }, { status: 451 });
    }
    if (error instanceof TverStreamNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof TverApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    if (error instanceof TverResolveError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error('stream resolve error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
