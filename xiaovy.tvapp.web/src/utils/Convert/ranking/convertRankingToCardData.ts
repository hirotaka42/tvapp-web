import { RankingData, ConvertedContent } from  '@/types/CardItem/RankingContent';

// ランキングデータをカード表示用のデータに変換する
export function convertRankingToCardData(rankingData: RankingData): ConvertedContent[] {
    return rankingData.contents.map(({ content }) => ({
        id: content.id,
        title: content.title,
        seriesID: content.seriesID,
        endAt: content.endAt,
        seriesTitle: content.seriesTitle,
        broadcasterName: content.broadcasterName,
        productionProviderName: content.productionProviderName,
        broadcastDateLabel: content.broadcastDateLabel,
        thumbnail: {
            small: `https://statics.tver.jp/images/content/thumbnail/episode/small/${content.id}.jpg`,
            xlarge: `https://statics.tver.jp/images/content/thumbnail/episode/xlarge/${content.id}.jpg`,
        },
        rank: content.rank,
    }));
}