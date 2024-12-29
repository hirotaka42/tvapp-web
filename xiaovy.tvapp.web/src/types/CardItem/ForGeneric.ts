export interface Data {
    label: string;
    contents: {
        content: Content;
    }[];
};

export interface Content {
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

export interface ConvertedCardViewContent {
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

