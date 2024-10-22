import { NextRequest, NextResponse } from "next/server";

// GET /api/service/call/ranking/episode/detail/[genre]
export async function GET(request: NextRequest, { params }: { params: { genre: string } }) {
    const { genre } = params;

    if (!genre || genre.trim() === '') {
        return NextResponse.json({ error: 'Genre が必須です。' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://service-api.tver.jp/api/v1/callEpisodeRankingDetail/${genre}`,
            {
                headers: {
                    'x-tver-platform-type': 'web',
                    'Origin': 'https://tver.jp',
                    'Referer': 'https://tver.jp/',
                },
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to retrieve ranking details' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}