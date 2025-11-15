import { NextRequest, NextResponse } from "next/server";

// GET /api/service/call/home?platformUid=xxxx&platformToken=xxxx
// Note: callHome API is deprecated and returns empty result.
// Using ranking APIs instead to build home page content.
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const platformUid = searchParams.get('platformUid');
    const platformToken = searchParams.get('platformToken');

    if (!platformUid || !platformToken) {
        return NextResponse.json({ error: 'platformUid, platformToken が必須です。' }, { status: 400 });
    }

    try {
        // Fetch multiple ranking genres to build home page
        // TVer API supports these ranking genres
        const genres = ['drama', 'variety', 'anime', 'documentary', 'sports'];
        const genreLabels: Record<string, string> = {
            'drama': 'ドラマランキング',
            'variety': 'バラエティランキング',
            'anime': 'アニメ／ヒーローランキング',
            'documentary': '報道／ドキュメンタリーランキング',
            'sports': 'スポーツランキング',
        };

        const rankingPromises = genres.map(async (genre) => {
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
                console.error(`Failed to fetch ${genre} ranking:`, response.status);
                return null;
            }

            const data = await response.json();
            return {
                genre,
                label: genreLabels[genre],
                data: data.result
            };
        });

        const rankings = await Promise.all(rankingPromises);
        const validRankings = rankings.filter(r => r !== null);

        // Transform ranking data into callHome response format
        const components = validRankings.map(ranking => {
            if (!ranking) return null;

            return {
                componentID: ranking.genre,
                type: 'episodeRanking',
                label: ranking.label,
                contents: ranking.data.contents.contents || []
            };
        }).filter(c => c !== null);

        const data = {
            api_version: "v1",
            code: 0,
            message: "",
            type: "hash",
            result: {
                components: components,
                latestNews: {
                    id: 0,
                    title: "",
                    label: "",
                    thumbnailURL: "",
                    targetURL: "",
                    ankerText: "",
                    anchorText: "",
                    openAt: 0,
                    updatedAt: 0
                },
                popup: null,
                shortcuts: {
                    latestUpdatedAt: 0,
                    contents: []
                },
                useFavoritedFlag: false
            }
        };

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}