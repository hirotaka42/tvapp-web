import { NextRequest, NextResponse } from "next/server";

// Genre types for TVer ranking API
type RankingGenre = 'drama' | 'variety' | 'anime' | 'documentary' | 'sports';

interface EpisodeContent {
    id: string;
    version: number;
    title?: string;
    seriesID?: string;
    endAt?: number;
    broadcastDateLabel?: string;
    isNHKContent?: boolean;
    isSubtitle?: boolean;
    ribbonID?: number;
    seriesTitle?: string;
    isAvailable?: boolean;
    broadcasterName?: string;
    productionProviderName?: string;
    isEndingSoon?: boolean;
    thumbnailPath?: string;
    [key: string]: unknown;
}

interface RankingResponse {
    api_version: string;
    code: number;
    message: string;
    type: string;
    result: {
        contents: {
            type: string;
            content: {
                id: string;
                version: number;
                title: string;
                productionProviderFilterType: number;
            };
            thumbnailType: string;
            contents: Array<{
                type: string;
                content: EpisodeContent;
                rank?: number;
            }>;
        };
    };
}

interface RankingData {
    genre: RankingGenre;
    label: string;
    data: RankingResponse['result'];
}

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
        const genres: RankingGenre[] = ['drama', 'variety', 'anime', 'documentary', 'sports'];
        const genreLabels: Record<RankingGenre, string> = {
            'drama': 'ドラマランキング',
            'variety': 'バラエティランキング',
            'anime': 'アニメ／ヒーローランキング',
            'documentary': '報道／ドキュメンタリーランキング',
            'sports': 'スポーツランキング',
        };

        const rankingPromises = genres.map(async (genre): Promise<RankingData | null> => {
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
                    console.error(`Failed to fetch ${genre} ranking:`, response.status);
                    return null;
                }

                const data: RankingResponse = await response.json();
                return {
                    genre,
                    label: genreLabels[genre],
                    data: data.result
                };
            } catch (error) {
                console.error(`Error fetching ${genre} ranking:`, error);
                return null;
            }
        });

        const rankings = await Promise.all(rankingPromises);
        const validRankings = rankings.filter((r): r is RankingData => r !== null);

        // Transform ranking data into callHome response format
        const components = validRankings.map(ranking => ({
            componentID: ranking.genre,
            type: 'episodeRanking',
            label: ranking.label,
            contents: ranking.data.contents.contents || []
        }));

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
