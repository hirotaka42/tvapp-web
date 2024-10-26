import { Main as EpisodesForSeriseIdResponseTypes } from '@/types/api/response/episodesForSeriseId'
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric'

export function convertCardContents(response: EpisodesForSeriseIdResponseTypes): ConvertedCardViewContent[] {
    const contents: ConvertedCardViewContent[] = [];

    response.data.result.contents.forEach(resultContent => {
        resultContent.contents.forEach(content => {
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
        });
    });

    return contents;
}

export default convertCardContents;