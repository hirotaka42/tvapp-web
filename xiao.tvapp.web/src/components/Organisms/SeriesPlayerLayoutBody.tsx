import React, { useState, useEffect} from 'react';
import { VideoPlayer } from '../Atoms/Player/VideoPlayer';
import { useStreamingService } from '../../hooks/StreamingHook';


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

export const SeriesPlayerLayoutBody: React.FC<{ episodeInfo: EpisodeResponse, episodeId: string }> = ({ episodeInfo, episodeId }) => {
  // #region Variable -----------------------
  const streamingService = useStreamingService();
  // #endregion
  
  // #region State -----------------------
  
  const [videoUrl, setVideoUrl] = useState<string>('');
  // #endregion

  // #region React Event -----------------------
  useEffect(() => {
    const fetchUrl = async () => {
      if (episodeId) {
        const url = await streamingService.getVideoUrl(episodeId);
        setVideoUrl(url);
      }
    };
    fetchUrl();
  }, [episodeInfo.id]);
  // #endregion


  // #region Screen Event -----------------------
  // #endregion

  // #region Logic -----------------------
  // #endregion
  return (
      <>
      <div style={{ 
        width: '100vw', // 横幅の90%
        height: 'calc(100vw * 9 / 16)', // 16:9のアスペクト比を保つ
        position: 'relative', 
        margin: 'auto' 
      }}>
        <VideoPlayer url={videoUrl} />
      </div>
      
      <div style={
        {
          width: '95vw',
          margin: 'auto',
          marginTop: '20px',
          textAlign: 'left'
        }
      }>
        {/* <p>{episodeInfo.share.text.replace('\n#TVer', '')}</p> */}
        <h3>{episodeInfo.title}</h3>
        <p>
            {episodeInfo.broadcastProviderLabel}<br></br>
            {episodeInfo.broadcastDateLabel}<br></br></p>
            {episodeInfo.description}<br></br>

        <p>https://tver.jp/episodes/{episodeInfo.id}</p>
      </div>
      
      </>
  );
}