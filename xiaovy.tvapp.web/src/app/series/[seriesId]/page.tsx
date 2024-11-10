"use client";
import React, { useState, useEffect } from 'react';
import { useSessionService } from '@/hooks/useSession';
import { GenreContentCardList } from '@/components/atomicDesign/molecules/GenreContentCardList';
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric';
import { convertCardContentsBySeason } from '@/utils/Convert/episodesForSeries/responseParser';
import { useSeriesService } from '@/hooks/useSeries';

interface SeasonGroupedContents {
    seasonTitle: string;
    contents: ConvertedCardViewContent[];
}

function SeriesEpisodesPage({ params }: { params: { seriesId: string } }) {
    const { seriesId } = params;
    const [seriesContents, setSeriesContents] = useState<SeasonGroupedContents[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const session = useSessionService();
    // TODO: 取得完了まで待ちたいが、プロアクティすがわからず、、
    const seriesContent = useSeriesService(seriesId, session);
    const [attempt, setAttempt] = useState<number>(0);

    // TODO: 取得完了まで待ちたいが、プロアクティすがわからず、、ここでの処理で正解？
    useEffect(() => {
        const maxAttempts = 5;  // 最大トライ数
        if (!seriesContent || !session) {
            if (attempt < maxAttempts) {
                const timer = setTimeout(() => {
                    setAttempt((prevAttempt) => prevAttempt + 1);
                }, 300);  // 300msごとに再試行
                return () => clearTimeout(timer);  // クリーンアップ
            } else {
                setLoading(false);
                console.error("シリーズコンテンツ情報を取得できませんでした。");
            }
            return;
        }
        const convertedData = convertCardContentsBySeason(seriesContent);
        setSeriesContents(convertedData);
        setLoading(false);
    }, [seriesContent, session, attempt, seriesId]);

    if (!seriesId)return <div>Series ID not provided</div>;
    if (loading || !seriesContents) return <div>Loading...</div>;

    return (
        <>
            {seriesContents.map((season, index) => (
                <div key={index}>
                    <h2
                        className="text-md font-bold tracking-tight pl-3 pr-3 mt-1 text-gray-900 dark:text-white truncate"
                    >{season.seasonTitle}</h2>
                    <GenreContentCardList contents={season.contents} />
                </div>
            ))}
        </>
    );
}

export default SeriesEpisodesPage;