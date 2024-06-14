export interface IStreamingService {
    getVideoUrl: (episodeId: string) => Promise<any>;
}