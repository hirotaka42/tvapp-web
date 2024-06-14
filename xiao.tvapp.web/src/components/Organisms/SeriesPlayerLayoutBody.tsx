import React from 'react';
import { VideoPlayer } from '../Atoms/Player/VideoPlayer';


interface Video {
    videoRefID: string;
    accountID: string;
    playerID: string;
    channelID: string;
  }
  
  interface ViewStatus {
    startAt: number;
    endAt: number;
  }
  
  interface Share {
    text: string;
    url: string;
  }
  
  interface SVOD {
    name: string;
    url: string;
  }
  
  interface EpisodeResponse {
    id: string;
    version: number;
    video: Video;
    title: string;
    seriesID: string;
    seasonID: string;
    description: string;
    no: number;
    broadcastProviderLabel: string;
    productionProviderLabel: string;
    broadcastDateLabel: string;
    broadcastProviderID: string;
    isSubtitle: boolean;
    copyright: string;
    viewStatus: ViewStatus;
    isAllowCast: boolean;
    share: Share;
    tags: Record<string, unknown>;
    isNHKContent: boolean;
    svod: SVOD[];
  }

export const SeriesPlayerLayoutBody: React.FC<{ episodeInfo: EpisodeResponse }> = ({ episodeInfo }) => {
  const url = episodeInfo.id;
  const videoUrl = `https://manifest.prod.boltdns.net/manifest/v1/hls/v3/aes128/6191645753001/1c825c88-dadf-40b9-8ba8-def72b114fc4/686343fa-e2c1-4de9-9ad3-80d8ccba314d/62c2d61a-9311-4a8a-814b-912313c45706/10s/rendition.m3u8?fastly_token=NjY2YzdmNTRfYjQ0ZGM5Mjg5OWQ4YTFiZjQxYWYwYzM0ZjNhNTJiYjFlMDhjM2U4MTAzZTJmZGUzMjAzYTIwYmZkZDRkZmRkYQ%3D%3D`;
    return (
        <>
        <VideoPlayer url={videoUrl} />
        <p>{episodeInfo.share.text.replace('\n#TVer', '')}</p>
        <h3>{episodeInfo.title}</h3>
        <p>
            {episodeInfo.broadcastProviderLabel}<br></br>
            {episodeInfo.broadcastDateLabel}<br></br></p>
            {episodeInfo.description}<br></br>

        <p>https://tver.jp/episodes/{episodeInfo.id}</p>
        </>
    );
}