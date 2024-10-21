import { Main as StreamResponseType } from '@/types/StreamResponse';
export interface IStreamService {
    getVideoUrl: (episodeId: string) => Promise<StreamResponseType>;
}