"use client";
import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { useStreamService } from '@/hooks/useStream';
import { useEpisodeService } from '@/hooks/useEpisode';
import { Main as StreamResponseType } from '@/types/StreamResponse';
import { Main as EpisodeResponseType } from '@/types/EpisodeResponse';
import { useAuth } from '@/hooks/useAuth';
import { updateFavoriteSeries } from '@/utils/Util/favoriteSeries';

function EpisodePage({ params }: { params: { episodeId: string } }) {
    const loginUser = useAuth();
    const { episodeId } = params;
    const [videoUrl, setVideoUrl] = useState<StreamResponseType | null>(null);
    const [episode, setEpisode] = useState<EpisodeResponseType | null>(null);
    const streamUrl = useStreamService(episodeId);
    const episodeInfo = useEpisodeService(episodeId);
    const [seriesTitle, setSeriesTitle] = useState<string>('');

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

    if (!episodeId) {
        return <div>Episode not found</div>;
    }

    if (!videoUrl|| !episode || !loginUser) {
        return <div>Loading...</div>;
    }
    const handleFavoriteClick = (seasonTitle: string, seriesId: string) => {
        alert('お気に入りに登録しました');
        updateFavoriteSeries(seasonTitle, seriesId);
    };
    
    return (
        <>
            <div style={{ 
                width: '100vw',
                height: 'calc(100vw * 9 / 16)',
                position: 'relative', 
                margin: 'auto' 
            }}>
                <VideoPlayer url={videoUrl.video_url} />
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
                    <a href={`/series/${episode.data.seriesID}`} className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100"
                    >
                        {seriesTitle}
                    </a>
                    <h3>{episode.data.title}</h3>
                    <p>
                        {episode.data.broadcastProviderLabel}<br></br>
                        {episode.data.broadcastDateLabel}<br></br>
                        {episode.data.description}<br></br>
                    </p>
                    <p>https://tver.jp/episodes/{episode.data.id}</p>
                </div>
                <div>
                    <button
                        onClick={() => handleFavoriteClick(seriesTitle, episode.data.seriesID)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        お気に入りに登録
                    </button>
                </div>
            </div>
        </>
    );
}

export default EpisodePage;