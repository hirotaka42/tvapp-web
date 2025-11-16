// 本家/api/service/call/seriesEpisodes/[seriesId]?platform_uid=XXXXXX&platform_token=XXXXXX
// のレスポンス

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
    contents: ResultContent[];
    seasons:  Season[];
}

export interface ResultContent {
    seasonTitle: string;
    hasNext:     boolean;
    contents:    PurpleContent[];
}

export interface PurpleContent {
    type:       string;
    content:    FluffyContent;
    resume:     Resume;
    isFavorite: boolean;
    isGood:     boolean;
    isLater:    boolean;
    goodCount:  number;
}

export interface FluffyContent {
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
    thumbnailURL?:          string;
}

export interface Resume {
    lastViewedDuration: number;
    contentDuration:    number;
    completed:          boolean;
}

export interface Season {
    type:    string;
    content: SeasonContent;
}

export interface SeasonContent {
    id:      string;
    version: number;
    title:   string;
}
