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
    components:       Component[];
    latestNews:       LatestNews;
    popup:            null;
    shortcuts:        Shortcuts;
    useFavoritedFlag: boolean;
}

export interface Component {
    componentID: string;
    type:        string;
    label:       string;
    contents:    ComponentContent[];
    optional?:   Optional;
}

export interface ComponentContent {
    type:           Type;
    content:        ContentContent;
    rank?:          number;
    startAt?:       number;
    endAt?:         number;
    favoriteCount?: number;
    isFavorite?:    boolean;
}

export interface ContentContent {
    id:                      string;
    version:                 number;
    title?:                  string;
    allowOrder?:             AllowOrder[];
    isNHKContent?:           boolean;
    seriesID?:               string;
    endAt?:                  number;
    broadcastDateLabel?:     string;
    isSubtitle?:             boolean;
    ribbonID?:               number;
    seriesTitle?:            string;
    isAvailable?:            boolean;
    broadcasterName?:        string;
    productionProviderName?: string;
    imageURL?:               string;
    targetURL?:              string;
    aspectRatio?:            AspectRatio;
    externalBrowser?:        boolean;
    label?:                  string;
    specialMainID?:          SpecialMainID;
    specialMainTitle?:       SpecialMainTitle;
    startAt?:                number;
    liveType?:               number;
    dvr?:                    DVR;
    onairStartAt?:           number;
    onairEndAt?:             number;
    allowPlatforms?:         string[];
    episodeCc?:              string;
    isDVRNow?:               boolean;
    name?:                   string;
    existsThumbnail?:        boolean;
}

export interface AllowOrder {
    key:  Key;
    name: Name;
}

export enum Key {
    Newer = "newer",
    Random = "random",
    Recommend = "recommend",
}

export enum Name {
    おすすめ = "おすすめ",
    ランダム = "ランダム",
    新着順 = "新着順",
}

export enum AspectRatio {
    The15 = "1:5",
    The16 = "1:6",
    The916 = "9:16",
}

export interface DVR {
    isDVR:          boolean;
    startAt:        number;
    endAt:          number;
    allowPlatforms: string[];
}

export enum SpecialMainID {
    Actor2409 = "actor_2409",
    Drama24Start10 = "drama24_start10",
    MeisakuDrama = "meisaku-drama",
}

export enum SpecialMainTitle {
    俳優特集 = "俳優特集",
    名作ドラマ特集 = "名作ドラマ特集",
    秋の新ドラマ特集 = "秋の新ドラマ特集",
}

export enum Type {
    Banner = "banner",
    Episode = "episode",
    Live = "live",
    Series = "series",
    Special = "special",
    SpecialMain = "specialMain",
    Talent = "talent",
}

export interface Optional {
    thv?:                Thv;
    titleImageURL?:      string;
    backgroundImageURL?: string;
    descriptions?:       string[] | null;
    isRichView?:         boolean;
    searchResultURL?:    string;
    id?:                 string;
    version?:            number;
    title?:              string;
    specialContent?:     SpecialContent;
}

export interface SpecialContent {
    type:    Type;
    content: SpecialContentContent;
}

export interface SpecialContentContent {
    id:               string;
    version:          number;
    title:            string;
    label:            string;
    specialMainID:    string;
    specialMainTitle: string;
}

export interface Thv {
    visible: boolean;
    refID:   string;
}

export interface LatestNews {
    id:           number;
    title:        string;
    label:        string;
    thumbnailURL: string;
    targetURL:    string;
    ankerText:    string;
    anchorText:   string;
    openAt:       number;
    updatedAt:    number;
}

export interface Shortcuts {
    latestUpdatedAt: number;
    contents:        ShortcutsContent[];
}

export interface ShortcutsContent {
    id:        number;
    name:      string;
    link:      string;
    isDefault: boolean;
    updatedAt: number;
}
