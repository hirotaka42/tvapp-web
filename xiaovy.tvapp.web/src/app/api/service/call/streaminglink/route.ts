import { NextRequest, NextResponse } from "next/server";

// GET /api/service/call/streaminglink?episodeId=xxxx

// Response
// {
//     "video_url": "https://sample"
// }
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');
    const functionHost = process.env.AZURE_FUNCTION_STREEAMING;
    const key = process.env.AZURE_FUNCTION_STREEAMING_CODE_KEY;

    if (!episodeId || episodeId.trim() === '') {
        return NextResponse.json({ error: 'episodeId が必須です。' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `${functionHost}/api/http_trigger?code=${key}&url=https://tver.jp/episodes/${episodeId}`,
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
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}