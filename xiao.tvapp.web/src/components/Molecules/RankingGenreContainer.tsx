import React from 'react';
import { ItemContainer } from '@/components/Atoms/Card/ItemContainer';
import { ContentData } from '@/types/ContentData';

// "contents": {
//     "type": "episodeRanking",
//     "content": {
//         "id": "anime",
//         "version": 1,
//         "title": "アニメ／ヒーロー"
//     },
//     "thumbnailType": "horizontal",
//     "contents": [
//         {
//             "type": "episode",
//             "content": {
//                 "id": "epmtcaeajl",
//                 "version": 7,
//                 "title": "第1122話 最後の教え！受け継がれた拳骨",
//                 "seriesID": "srkq2shp9d",
//                 "endAt": 1729384200,
//                 "broadcastDateLabel": "10月13日(日)放送分",
//                 "isNHKContent": false,
//                 "isSubtitle": false,
//                 "ribbonID": 0,
//                 "seriesTitle": "ワンピース",
//                 "isAvailable": true,
//                 "broadcasterName": "フジテレビ",
//                 "productionProviderName": "フジテレビ"
//             },
//             "rank": 1
//         },

interface Content {
    type: string;
    content: ContentData;
    rank: number;
  }
  
  interface ComponentType {
    type: string;
    content: {
      id: string;
      version: number;
      title: string;
    }
    contents: Content[];
    thumbnailType: string;
  }

export const RankingGenreContainer: React.FC<{ rankingData: ComponentType }> = ({ rankingData }) => {
    return (
        <>
            <h3 style={{ marginLeft: '16px', marginBottom: 0, marginTop: 0 }}>{rankingData.content.title}</h3>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap', // 折り返しを有効
                gap: '16px', // アイテム間のスペースを設定
                overflowX: 'auto',
                padding: '16px'
            }}>
                {rankingData.contents.map((content) => (
                    <ItemContainer
                        key={content.content.id} // ユニークなキーを使用 // todo
                        item={content}
                    />
                ))}
            </div>
        </>
    );
}