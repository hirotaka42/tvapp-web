import { NextRequest, NextResponse } from "next/server";

// GET /api/service/call/episode?episodeId=xxxx&platformUid=xxxx&platformToken=xxxx
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');
    const platformUid = searchParams.get('platformUid');
    const platformToken = searchParams.get('platformToken');

    if (!episodeId || !platformUid || !platformToken) {
        return NextResponse.json({ error: 'episodeId, platformUid, platformToken が必須です。' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://platform-api.tver.jp/service/api/v1/callEpisode/${episodeId}?platform_uid=${platformUid}&platform_token=${platformToken}`,
            {
                headers: {
                    'x-tver-platform-type': 'web',
                    'Origin': 'https://tver.jp',
                    'Referer': 'https://tver.jp/',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to retrieve callEpisode results' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}