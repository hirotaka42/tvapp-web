export interface ICallEpisodeService {
    callEpisode: (episodeId: string) => Promise<any>;
}