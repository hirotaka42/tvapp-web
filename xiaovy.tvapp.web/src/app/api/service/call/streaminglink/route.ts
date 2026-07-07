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
// 解決の二段構え:
//  1) AZURE_FUNCTION_STREEAMING が設定されていれば、日本リージョンの Azure Function
//     (Platform-Stream-Loader)へ委譲する。TVER/Streaks は JP-egress を要求するため、
//     Cloudflare Workers(海外/データセンターIP)から直接叩くと地域制限で弾かれる。
//     Azure(日本リージョン)経由なら JP-egress で解決でき、ABEMA/YouTube 等も yt-dlp で対応可能。
//  2) 未設定なら、純 TS の TVER→Streaks 解決を使う(ローカル/JP-egress ホスト向け)。
//
// Response: { video_url: string, m3u8_urls: string[], subtitles: {lang,url}[], title?, duration? }

const AZURE_HOST = process.env.AZURE_FUNCTION_STREEAMING;
const AZURE_KEY = process.env.AZURE_FUNCTION_STREEAMING_CODE_KEY;

/** 日本リージョンの Azure Function へ委譲して m3u8 を得る(JP-egress で地域制限を回避)。 */
async function resolveViaAzure(episodeId: string) {
  const url =
    `${AZURE_HOST}/api/backend_stream_url_http` +
    `?code=${encodeURIComponent(AZURE_KEY ?? '')}` +
    `&url=${encodeURIComponent(`https://tver.jp/episodes/${episodeId}`)}` +
    `&service_id=1&res_type=6`;
  const res = await fetch(url, {
    headers: {
      'x-tver-platform-type': 'web',
      Origin: 'https://tver.jp',
      Referer: 'https://tver.jp/',
    },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: 'ストリーム解決(Azure)に失敗しました' },
      { status: res.status },
    );
  }
  const data = (await res.json()) as { manifest_dict?: { urls?: string[] } };
  const urls = data?.manifest_dict?.urls ?? [];
  if (!urls[0]) {
    return NextResponse.json({ error: '再生できる動画が見つかりませんでした' }, { status: 404 });
  }
  return NextResponse.json({ video_url: urls[0], m3u8_urls: urls, subtitles: [] });
}

export async function GET(request: NextRequest) {
  const episodeId = new URL(request.url).searchParams.get('episodeId');

  if (!episodeId || episodeId.trim() === '') {
    return NextResponse.json({ error: 'episodeId が必須です。' }, { status: 400 });
  }

  // 1) Azure Function(日本リージョン)が設定されていれば委譲
  if (AZURE_HOST) {
    try {
      return await resolveViaAzure(episodeId);
    } catch (error) {
      console.error('Azure resolve error:', error);
      return NextResponse.json({ error: 'ストリーム解決(Azure)でエラーが発生しました' }, { status: 502 });
    }
  }

  // 2) 純 TS 解決(ローカル / JP-egress ホスト)
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
