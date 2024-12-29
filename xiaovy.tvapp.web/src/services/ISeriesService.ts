import { Main as EpisodesForSeriseIdResponseTypes } from '@/types/api/response/episodesForSeriseId'
import { sessionToken } from '@/types/Token';

export interface ISeriesService {
    callSeriesContents: (seriesId: string, session: sessionToken) => Promise<EpisodesForSeriseIdResponseTypes>;
}