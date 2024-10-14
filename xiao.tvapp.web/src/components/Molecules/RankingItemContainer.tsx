import React from 'react';
import { ItemContainer } from '@/components/Atoms/Card/ItemContainer';
import { ContentData } from '@/types/ContentData';

// {
//   "componentID": "ranking-drama.",
//   "type": "episodeRanking",
//   "label": "ドラマランキング",
//   "contents": [
//       {
//           "type": "episode",
//           "content": {
//               "id": "epzjmzse1d",
//               "version": 9,
//               "title": "第1話 保健室にはなるべく来ないでもらいたい",
//               "seriesID": "srbzu3axsx",
//               "endAt": 1735387140,
//               "broadcastDateLabel": "10月12日(土)放送分",
//               "isNHKContent": false,
//               "isSubtitle": true,
//               "ribbonID": 0,
//               "seriesTitle": "放課後カルテ",
//               "isAvailable": true,
//               "broadcasterName": "日テレ",
//               "productionProviderName": "日テレ"
//           },
//           "rank": 1
//       },

interface Contents {
    type: string;
    content: ContentData;
    rank: number;
}

interface ComponentType {
  componentID: string;
  type: string;
  label: string;
  contents: Contents[];
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