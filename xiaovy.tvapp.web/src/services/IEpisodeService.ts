import { Main as EpisodeResponseType } from '@/types/EpisodeResponse';

export interface IEpisodeService {
    callEpisodeInfo: (episodeId: string) => Promise<EpisodeResponseType>;
}