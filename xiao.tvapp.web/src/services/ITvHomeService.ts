export interface ITvHomeService {
    callHome: (platformUid: string, platformToken: string) => Promise<any>;
}