import { NextRequest, NextResponse } from "next/server";

// GET /api/content/series/[seriesId]
export async function GET(request: NextRequest, { params }: { params: { seriesId: string } }) {
    const { seriesId } = params;

    if (!seriesId) {
        return NextResponse.json({ error: 'seriesId は必須です。' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://statics.tver.jp/content/series/${seriesId}.json`, {
            headers: {
                'x-tver-platform-type': 'web',
                'Origin': 'https://tver.jp',
                'Referer': 'https://tver.jp/',
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to retrieve content results' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}