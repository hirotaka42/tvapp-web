import React from 'react';
import { ItemContainer } from '../Atoms/Card/ItemContainer';

interface Content {
    type: string;
    content: {
      id: string;
      version: number;
      title: string;
      seriesID: string;
      endAt: number;
      broadcastDateLabel: string;
      isNHKContent: boolean;
      isSubtitle: boolean;
      ribbonID: number;
      seriesTitle: string;
      isAvailable: boolean;
      broadcasterName: string;
      productionProviderName: string;
    };
    rank: number;
  }

export const RankingItemContainer: React.FC<{ rankingData: Content[] }> = ({ rankingData }) => {
    return (
        <>
        <div style={{ display: 'flex', flexDirection: 'row', overflowX: 'auto'}}>
            {rankingData.map((content, index) => (
                <ItemContainer
                    key={index}
                    id={content.content.id}
                    episodeTitle={content.content.title}
                    seriesTitle={content.content.seriesTitle}
                    broadcastDateLabel={content.content.broadcastDateLabel}
                    broadcasterName={content.content.broadcasterName}
                />
            ))}
        </div>

        {rankingData.map((content, index) => (
        <ItemContainer
          key={index}
          id={content.content.id}
          episodeTitle={content.content.title}
          seriesTitle={content.content.seriesTitle}
          broadcastDateLabel={content.content.broadcastDateLabel}
          broadcasterName={content.content.broadcasterName}
        />
      ))} 
      </>
    );
}