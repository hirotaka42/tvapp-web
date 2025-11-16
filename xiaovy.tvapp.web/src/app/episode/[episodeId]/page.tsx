"use client";
import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { useStreamService } from '@/hooks/useStream';
import { useEpisodeService } from '@/hooks/useEpisode';
import { Main as StreamResponseType } from '@/types/StreamResponse';
import { Main as EpisodeResponseType } from '@/types/EpisodeResponse';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useSessionService } from '@/hooks/useSession';
import { useSeriesService } from '@/hooks/useSeries';
import { convertCardContentsBySeason } from '@/utils/Convert/episodesForSeries/responseParser';
import { GenreContentCardList } from '@/components/atomicDesign/molecules/GenreContentCardList';
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric';
import { FavoriteButton } from '@/components/atomicDesign/atoms/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatchHistory } from '@/hooks/useWatchHistory';

interface SeasonGroupedContents {
    seasonTitle: string;
    contents: ConvertedCardViewContent[];
}

function EpisodePage({ params }: { params: { episodeId: string } }) {
    const { user: loginUser } = useFirebaseAuth();
    const { episodeId } = params;
    const [videoUrl, setVideoUrl] = useState<StreamResponseType | null>(null);
    const [episode, setEpisode] = useState<EpisodeResponseType | null>(null);
    const streamUrl = useStreamService(episodeId);
    const episodeInfo = useEpisodeService(episodeId);
    const [seriesTitle, setSeriesTitle] = useState<string>('');
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const session = useSessionService();
    const [seriesEpisodes, setSeriesEpisodes] = useState<SeasonGroupedContents[] | null>(null);
    const seriesContent = useSeriesService(episode?.data.seriesID || '', session);
    const { isFavorite: checkIsFavorite } = useFavorites();
    const { recordHistory } = useWatchHistory();
    const [historyRecorded, setHistoryRecorded] = useState<boolean>(false);

    useEffect(() => {
        if (streamUrl) {
            setVideoUrl(streamUrl);
        }
    }, [streamUrl]);

    useEffect(() => {
        if (episodeInfo) {
            setEpisode(episodeInfo);
            setSeriesTitle(episodeInfo.data.share.text.replace('\n#TVer', ''));
        }
    }, [episodeInfo]);

    // お気に入りの状態を確認するuseEffect
    useEffect(() => {
        const checkFavorite = async () => {
            if (episodeInfo && loginUser && !loginUser.isAnonymous) {
                try {
                    const isFav = await checkIsFavorite(episodeInfo.data.seriesID);
                    setIsFavorite(isFav);
                } catch (error) {
                    console.error('お気に入り状態の確認に失敗:', error);
                }
            }
        };
        checkFavorite();
    }, [episodeInfo, loginUser, checkIsFavorite]);

    // シリーズエピソードリストを取得するuseEffect
    useEffect(() => {
        if (seriesContent) {
            const convertedData = convertCardContentsBySeason(seriesContent);
            setSeriesEpisodes(convertedData);
        }
    }, [seriesContent]);

    // 視聴履歴を記録するuseEffect
    useEffect(() => {
        const recordWatchHistory = async () => {
            if (episode && videoUrl && loginUser && !loginUser.isAnonymous && !historyRecorded) {
                try {
                    await recordHistory({
                        episodeId: episode.data.id,
                        episodeTitle: episode.data.title,
                        seriesId: episode.data.seriesID,
                        seriesTitle: seriesTitle || episode.data.share.text.replace('\n#TVer', ''),
                        thumbnailUrl: episode.data.image?.standard || '',
                        description: episode.data.description || '',
                    });
                    setHistoryRecorded(true);
                    console.log('視聴履歴を記録しました');
                } catch (error) {
                    console.error('視聴履歴の記録に失敗:', error);
                }
            }
        };
        recordWatchHistory();
    }, [episode, videoUrl, loginUser, historyRecorded, seriesTitle, recordHistory]);

    if (!episodeId) {
        return <div>Episode not found</div>;
    }

    if (!loginUser || !episode) {
        return <div>Loading...</div>;
    }

    const handleFavoriteToggle = (newState: boolean) => {
        setIsFavorite(newState);
    };
    
    return (
        <>
            <div style={{
                width: '100vw',
                height: 'calc(100vw * 9 / 16)',
                position: 'relative',
                margin: 'auto',
                backgroundColor: '#000'
            }}>
                {videoUrl ? (
                    <VideoPlayer url={videoUrl.video_url} />
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                    }}>
                        <div className="text-white text-lg">動画を読み込み中...</div>
                    </div>
                )}
            </div>
            <div style={
                {
                width: '95vw',
                margin: 'auto',
                marginTop: '20px',
                textAlign: 'left'
                }
            }>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <a href={`/series/${episode.data.seriesID}`} className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100"
                        >
                            {seriesTitle}
                        </a>
                        {!loginUser.isAnonymous && (
                            <FavoriteButton
                                seriesId={episode.data.seriesID}
                                seriesTitle={seriesTitle}
                                isFavorite={isFavorite}
                                onToggle={handleFavoriteToggle}
                            />
                        )}
                    </div>
                    <h3>{episode.data.title}</h3>
                    <p>
                        {episode.data.broadcastProviderLabel}<br></br>
                        {episode.data.broadcastDateLabel}<br></br>
                        {episode.data.description}<br></br>
                    </p>
                    <p>https://tver.jp/episodes/{episode.data.id}</p>
                </div>
            </div>
            {seriesEpisodes && seriesEpisodes.length > 0 && (
                <div style={{
                    width: '95vw',
                    margin: 'auto',
                    marginTop: '40px'
                }}>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">エピソード</h2>
                    {seriesEpisodes.map((season, index) => (
                        <div key={index} className="mb-6">
                            <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                {season.seasonTitle}
                            </h3>
                            <GenreContentCardList contents={season.contents} />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default EpisodePage;