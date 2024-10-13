import React, { useState, useEffect} from 'react';
import { useCallEpisodeService } from '../../hooks/CallEpisodeHook';
import { SeriesPlayerLayoutBody } from '../Organisms/SeriesPlayerLayoutBody';
import { StreamingServiceContext } from '../../contexts/StreamingContext';
import { StreamingService } from '../../services/implementation/StreamingService';

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



export const EpisodeItemPageComponent: React.FC<{ episodeId: string }> = ({ episodeId }) => {
    // #region Variable -----------------------
    const callEpisodeService = useCallEpisodeService();
    // #endregion
    
    // #region State -----------------------
    const [episodeInfo, setEpisodeInfo] = useState<EpisodeResponse>({
      id: '',
      version: 0,
      video: {
        videoRefID: '',
        accountID: '',
        playerID: '',
        channelID: '',
      },
      title: '',
      seriesID: '',
      seasonID: '',
      description: '',
      no: 0,
      broadcastProviderLabel: '',
      productionProviderLabel: '',
      broadcastDateLabel: '',
      broadcastProviderID: '',
      isSubtitle: false,
      copyright: '',
      viewStatus: {
        startAt: 0,
        endAt: 0,
      },
      isAllowCast: false,
      share: {
        text: '',
        url: '',
      },
      tags: {},
      isNHKContent: false,
      svod: [],
    });

    // #endregion
  
    // #region React Event -----------------------
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await callEpisodeService.callEpisode(episodeId);
          setEpisodeInfo(response.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
  
    }, []);
    // #endregion
  
  
    // #region Screen Event -----------------------
    // #endregion
  
    // #region Logic -----------------------
    // #endregion
  
    return (
      <>
        <StreamingServiceContext.Provider value={StreamingService}>
          <SeriesPlayerLayoutBody episodeInfo={episodeInfo} episodeId={episodeId}/>
        </StreamingServiceContext.Provider>
      </>
    );
}