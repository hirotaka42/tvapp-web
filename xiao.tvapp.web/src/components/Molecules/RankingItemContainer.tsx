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

interface ComponentType {
  componentID: string;
  type: string;
  label: string;
  contents: Content[];
}

export const RankingItemContainer: React.FC<{ rankingData: ComponentType }> = ({ rankingData }) => {
    return (
        <>
        <h3>{rankingData.label}</h3>
        <div style={{ display: 'flex', flexDirection: 'row', overflowX: 'auto'}}>
            {rankingData.contents.map((content, index) => (
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
      </>
    );
}