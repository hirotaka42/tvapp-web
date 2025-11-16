export interface Main {
    data: Data;
}

export interface Data {
    id:                      string;
    version:                 number;
    video:                   Video;
    title:                   string;
    seriesID:                string;
    seasonID:                string;
    description:             string;
    no:                      number;
    broadcastProviderLabel:  string;
    productionProviderLabel: string;
    broadcastDateLabel:      string;
    broadcastProviderID:     string;
    isSubtitle:              boolean;
    copyright:               string;
    viewStatus:              ViewStatus;
    isAllowCast:             boolean;
    share:                   Share;
    tags:                    Tags;
    isNHKContent:            boolean;
    svod:                    Svod[];
    image?:                  ImageData;
}

export interface ImageData {
    standard: string;
}

export interface Share {
    text: string;
    url:  string;
}

export interface Svod {
    name: string;
    url:  string;
}

export type Tags = object;

export interface Video {
    videoRefID: string;
    accountID:  string;
    playerID:   string;
    channelID:  string;
}

export interface ViewStatus {
    startAt: number;
    endAt:   number;
}
