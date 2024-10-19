import { NextRequest, NextResponse } from "next/server";

// GET /api/service/search?keyword=xxx&platformUid=xxx&platformToken=xxx
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const platformUid = searchParams.get('platformUid');
    const platformToken = searchParams.get('platformToken');

    if (!keyword || !platformUid || !platformToken) {
    return NextResponse.json({ error: 'Keyword, platformUid, platformToken が必須です。' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://platform-api.tver.jp/service/api/v1/callKeywordSearch?platform_uid=${platformUid}&platform_token=${platformToken}&keyword=${keyword}`,
            {
            headers: {
                'x-tver-platform-type': 'web',
                'Origin': 'https://tver.jp',
                'Referer': 'https://tver.jp/',
            },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to retrieve search results' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error:", error); 
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}