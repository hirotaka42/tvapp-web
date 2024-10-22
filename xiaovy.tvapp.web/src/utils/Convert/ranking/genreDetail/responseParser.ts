import { Main as GenreDetailResponseTypes , ContentElement } from '@/types/RankingGenreDetailResponse'

export function convertEpisodeRankingResponse(response: GenreDetailResponseTypes) {
    if (!response || !response.data || !response.data.result || !response.data.result.contents) {
        return { label: '', contents: [] };
    }

    const { contents } = response.data.result;
    if (!contents || !contents.contents) {
        return { label: '', contents: [] };
    }

    return {
        label: contents.content.title,
        contents: contents.contents.map((element: ContentElement) => ({
            content: {
                id: element.content.id,
                title: element.content.title,
                seriesID: element.content.seriesID,
                endAt: element.content.endAt,
                seriesTitle: element.content.seriesTitle,
                broadcasterName: element.content.broadcasterName,
                productionProviderName: element.content.productionProviderName,
                broadcastDateLabel: element.content.broadcastDateLabel,
                rank: element.rank,
            }
        }))
    };
}

export default convertEpisodeRankingResponse;