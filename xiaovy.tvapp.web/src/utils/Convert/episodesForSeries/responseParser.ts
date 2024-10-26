import { Main as EpisodesForSeriseIdResponseTypes } from '@/types/api/response/episodesForSeriseId'
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric'
interface SeasonGroupedContents {
    seasonTitle: string;
    contents: ConvertedCardViewContent[];
}

// episodeリストのみを取り出す
export function convertCardContents(response: EpisodesForSeriseIdResponseTypes): ConvertedCardViewContent[] {
    const contents: ConvertedCardViewContent[] = [];

    response.data.result.contents.forEach(resultContent => {
        resultContent.contents.forEach(content => {
            if(content.type === "episode") {
                const convertedContent: ConvertedCardViewContent = {
                    // 別の場所でも使われているので、共通化したい
                    // TODO: 共通化
                    id: content.content.id,
                    title: content.content.title,
                    seriesID: content.content.seriesID,
                    endAt: content.content.endAt,
                    seriesTitle: content.content.seriesTitle,
                    broadcasterName: content.content.broadcasterName,
                    productionProviderName: content.content.productionProviderName,
                    broadcastDateLabel: content.content.broadcastDateLabel,
                    thumbnail: {
                        small: `https://statics.tver.jp/images/content/thumbnail/episode/small/${content.content.id}.jpg`,
                        xlarge: `https://statics.tver.jp/images/content/thumbnail/episode/xlarge/${content.content.id}.jpg`,
                    },
                    rank: 0,
                };
                contents.push(convertedContent);
            }
        });
    });

    return contents;
}

// シーズンごとにepisodeリストを取り出す
export function convertCardContentsBySeason(response: EpisodesForSeriseIdResponseTypes): SeasonGroupedContents[] {
    const seasonGroupedContents: SeasonGroupedContents[] = [];

    response.data.result.contents.forEach(resultContent => {
        const convertedContents: ConvertedCardViewContent[] = [];

        resultContent.contents.forEach(content => {
            if(content.type === "episode") {  // "episode" のみ処理
                const convertedContent: ConvertedCardViewContent = {
                    id: content.content.id,
                    title: content.content.title,
                    seriesID: content.content.seriesID,
                    endAt: content.content.endAt,
                    seriesTitle: content.content.seriesTitle,
                    broadcasterName: content.content.broadcasterName,
                    productionProviderName: content.content.productionProviderName,
                    broadcastDateLabel: content.content.broadcastDateLabel,
                    thumbnail: {
                        small: `https://statics.tver.jp/images/content/thumbnail/episode/small/${content.content.id}.jpg`,
                        xlarge: `https://statics.tver.jp/images/content/thumbnail/episode/xlarge/${content.content.id}.jpg`,
                    },
                    rank: 0,
                };
                convertedContents.push(convertedContent);
            }
        });

        if (convertedContents.length > 0) {
            seasonGroupedContents.push({
                seasonTitle: resultContent.seasonTitle,
                contents: convertedContents
            });
        }
    });

    return seasonGroupedContents;
}
