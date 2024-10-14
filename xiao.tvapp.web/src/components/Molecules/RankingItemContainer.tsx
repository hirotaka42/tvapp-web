import React from 'react';
import { ItemContainer } from '@/components/Atoms/Card/ItemContainer';
import { ContentData } from '@/types/ContentData';

interface Content {
    type: string;
    content: ContentData;
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
                    item={content}
                />
            ))}
        </div>
      </>
    );
}