import { NextRequest, NextResponse } from "next/server";

// GET /api/service/call/home?platformUid=xxxx&platformToken=xxxx
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const platformUid = searchParams.get('platformUid');
    const platformToken = searchParams.get('platformToken');

    if (!platformUid || !platformToken) {
        return NextResponse.json({ error: 'platformUid, platformToken が必須です。' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://platform-api.tver.jp/service/api/v1/callHome?platform_uid=${platformUid}&platform_token=${platformToken}`,
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