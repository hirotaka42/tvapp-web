import React from 'react';


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
    return (
        <>
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