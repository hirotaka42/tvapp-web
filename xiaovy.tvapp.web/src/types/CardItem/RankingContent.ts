export interface RankingData {
    label: string;
    contents: {
        content: RankingContent;
    }[];
};

export interface RankingContent {
    id: string;
    title: string;
    seriesID: string;
    endAt: number;
    seriesTitle: string;
    broadcasterName: string;
    productionProviderName: string;
    broadcastDateLabel: string;
    rank: number;
};

export interface ConvertedContent {
    id: string;
    title: string;
    seriesID: string;
    endAt: number;
    seriesTitle: string;
    broadcasterName: string;
    productionProviderName: string;
    broadcastDateLabel: string;
    thumbnail: {
        small: string;
        xlarge: string;
    };
    rank: number;
};

