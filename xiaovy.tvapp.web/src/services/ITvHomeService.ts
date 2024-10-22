import { Main as HomeResponseType } from '@/types/HomeResponse';

export interface ITvHomeService {
    callHome: (platformUid: string, platformToken: string) => Promise<HomeResponseType>;
}