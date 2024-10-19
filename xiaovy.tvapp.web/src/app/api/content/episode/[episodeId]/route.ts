import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

// /api/content/episode/[episodeId]
export async function GET(request: NextRequest, { params }: { params: { episodeId: string } }) {
    const { episodeId } = params;

    if (!episodeId) {
        return NextResponse.json({ error: 'episodeId は必須です。' }, { status: 400 });
    }

    try {
        const response = await axios.get(`https://statics.tver.jp/content/episode/${episodeId}.json`, {
            headers: {
                'x-tver-platform-type': 'web',
                'Origin': 'https://tver.jp',
                'Referer': 'https://tver.jp/',
            }
        });

        if (response.status !== 200) {
            return NextResponse.json({ error: 'Failed to retrieve content results' }, { status: response.status });
        }

        return NextResponse.json({ data: response.data });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}