export interface Main {
    data: Data;
}

export interface Data {
    api_version: string;
    code:        number;
    message:     string;
    type:        string;
    result:      Result;
}

export interface Result {
    contents: Contents;
}

export interface Contents {
    type:          string;
    content:       PurpleContent;
    thumbnailType: string;
    contents:      ContentElement[];
}

export interface PurpleContent {
    id:      string;
    version: number;
    title:   string;
}

export interface ContentElement {
    type:    Type;
    content: ContentContent;
    rank:    number;
}

export interface ContentContent {
    id:                     string;
    version:                number;
    title:                  string;
    seriesID:               string;
    endAt:                  number;
    broadcastDateLabel:     string;
    isNHKContent:           boolean;
    isSubtitle:             boolean;
    ribbonID:               number;
    seriesTitle:            string;
    isAvailable:            boolean;
    broadcasterName:        string;
    productionProviderName: string;
}

export enum Type {
    Episode = "episode",
}
