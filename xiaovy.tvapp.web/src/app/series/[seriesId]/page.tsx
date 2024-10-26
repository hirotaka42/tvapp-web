"use client";
import React, { useState, useEffect } from 'react';
import { useSessionService } from '@/hooks/useSession';
import { RankingContentCardList } from '@/components/atomicDesign/molecules/RankingContentCardList';
import { convertCardContents } from '@/utils/Convert/episodesForSeries/responseParser'
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric';

function SeriesEpisodesPage({ params }: { params: { seriesId: string } }) {
    const { seriesId } = params;
    const [episodeData, setEpisodeData] = useState<ConvertedCardViewContent[] | null>(null);
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
                console.log("Episode data:", data);
                const convertedData = convertCardContents(data);
                setEpisodeData(convertedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEpisodeData();
    }, [seriesId, session]);

    if (!seriesId) {
        return <div>Series ID not provided</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!episodeData) {
        return <div>Error loading episode data</div>;
    }

    return (
        <>
        <RankingContentCardList contents={episodeData} />
        </>
    );
}

export default SeriesEpisodesPage;