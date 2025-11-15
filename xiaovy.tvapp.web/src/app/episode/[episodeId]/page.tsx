"use client";
import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { useStreamService } from '@/hooks/useStream';
import { useEpisodeService } from '@/hooks/useEpisode';
import { Main as StreamResponseType } from '@/types/StreamResponse';
import { Main as EpisodeResponseType } from '@/types/EpisodeResponse';
import { useAuth } from '@/hooks/useAuth';
import { updateFavoriteSeries, isFavoriteSeriesExists, deleteFavoriteSeriesBySeriesId } from '@/utils/Util/favoriteSeries';
import { useSessionService } from '@/hooks/useSession';
import { useSeriesService } from '@/hooks/useSeries';
import { convertCardContentsBySeason } from '@/utils/Convert/episodesForSeries/responseParser';
import { GenreContentCardList } from '@/components/atomicDesign/molecules/GenreContentCardList';
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric';

interface SeasonGroupedContents {
    seasonTitle: string;
    contents: ConvertedCardViewContent[];
}

function EpisodePage({ params }: { params: { episodeId: string } }) {
    const loginUser = useAuth();
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
        if (episodeInfo) {
            const isFavorited = isFavoriteSeriesExists(episodeInfo.data.seriesID);
            setIsFavorite(isFavorited);
        }
    }, [episodeInfo]);

    // シリーズエピソードリストを取得するuseEffect
    useEffect(() => {
        if (seriesContent) {
            const convertedData = convertCardContentsBySeason(seriesContent);
            setSeriesEpisodes(convertedData);
        }
    }, [seriesContent]);

    if (!episodeId) {
        return <div>Episode not found</div>;
    }

    if (!loginUser || !episode) {
        return <div>Loading...</div>;
    }

    const handleFavoriteClick = (seriesTitle: string, seriesId: string) => {
        // お気に入りの登録／解除の切り替え
        if (isFavorite) {
            deleteFavoriteSeriesBySeriesId(seriesId);
            alert('お気に入りを解除しました');
        } else {
            updateFavoriteSeries(seriesTitle, seriesId);
            alert('お気に入りに登録しました');
        }
        // 状態を反転させる
        setIsFavorite(!isFavorite);
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
                        <button
                            onClick={() => handleFavoriteClick(seriesTitle, episode.data.seriesID)}
                            className="text-2xl hover:scale-110 transition-transform"
                            aria-label={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
                            title={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
                        >
                            {isFavorite ? '★' : '☆'}
                        </button>
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