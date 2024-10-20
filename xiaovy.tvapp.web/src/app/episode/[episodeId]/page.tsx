"use client";
import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { useStreamService } from '@/hooks/useStream';
import { Main as StreamResponseType } from '@/types/StreamResponse';

function EpisodePage({ params }: { params: { episodeId: string } }) {
    const { episodeId } = params;
    const [videoUrl, setVideoUrl] = useState<StreamResponseType | null>(null);
    const streamUrl = useStreamService(episodeId);

    useEffect(() => {
        if (streamUrl) {
            setVideoUrl(streamUrl);
        }
    }, [streamUrl]);

    if (!episodeId) {
        return <div>Episode not found</div>;
    }

    if (!videoUrl) {
        return <div>Loading...</div>;
    }

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
        </>
    );
}

export default EpisodePage;