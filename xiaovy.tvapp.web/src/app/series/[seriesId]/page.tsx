"use client";
import React, { useState, useEffect } from 'react';
import { useSessionService } from '@/hooks/useSession';
import { RankingContentCardList } from '@/components/atomicDesign/molecules/RankingContentCardList';
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric';
import { convertCardContentsBySeason } from '@/utils/Convert/episodesForSeries/responseParser';

interface SeasonGroupedContents {
    seasonTitle: string;
    contents: ConvertedCardViewContent[];
}

function SeriesEpisodesPage({ params }: { params: { seriesId: string } }) {
    const { seriesId } = params;
    const [episodeData, setEpisodeData] = useState<SeasonGroupedContents[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const session = useSessionService();

    useEffect(() => {
        async function fetchEpisodeData() {
            if (!session) {
                console.error("Session is null or undefined");
                setLoading(false);
                return;
            }
            try {
                const platformUid = session.platformUid;
                const platformToken = session.platformToken;
                const response = await fetch(`/api/service/call/seriesEpisodes/${seriesId}?platform_uid=${platformUid}&platform_token=${platformToken}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch episode data');
                }

                const data = await response.json();
                const convertedData = convertCardContentsBySeason(data);
                setEpisodeData(convertedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEpisodeData();
    }, [seriesId, session]);

    if (!seriesId)return <div>Series ID not provided</div>;
    if (loading || !episodeData) return <div>Loading...</div>;

    return (
        <>
            {episodeData.map((season, index) => (
                <div key={index}>
                    <h2
                        className="text-md font-bold tracking-tight pl-3 pr-3 mt-1 text-gray-900 dark:text-white truncate"
                    >{season.seasonTitle}</h2>
                    <RankingContentCardList contents={season.contents} />
                </div>
            ))}
        </>
    );
}

export default SeriesEpisodesPage;