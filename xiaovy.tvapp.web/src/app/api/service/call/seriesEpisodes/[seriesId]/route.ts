import { NextRequest, NextResponse } from "next/server";

// GET /api/service/call/seriesEpisodes/[seriesId]?platform_uid=XXXXXX&platform_token=XXXXXX
export async function GET(request: NextRequest) {
    const { pathname, searchParams } = new URL(request.url);
    const seriesId = pathname.split('/').pop();
    const platformUid = searchParams.get('platform_uid');
    const platformToken = searchParams.get('platform_token');

    if (!seriesId || !platformUid || !platformToken) {
        return NextResponse.json({ error: 'seriesId, platform_uid, platform_token が必須です。' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://platform-api.tver.jp/service/api/v1/callSeriesEpisodes/${seriesId}?platform_uid=${platformUid}&platform_token=${platformToken}&require_data=later%2Cgood%2Cresume`,
            {
                headers: {
                    'x-tver-platform-type': 'web',
                    'Origin': 'https://tver.jp',
                    'Referer': 'https://tver.jp/',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to retrieve call results' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}