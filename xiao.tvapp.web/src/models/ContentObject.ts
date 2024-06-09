
export interface ContentObject {
    type: string
    content: {
      id: string;
      version: number;
      title: string;
      seriesID: string;
      endAt: number;
      broadcastDateLabel: string;
      isNHKContent: boolean;
      isSubtitle: boolean;
      ribbonID: number;
      seriesTitle: string;
      isAvailable: boolean;
      broadcasterName: string;
      productionProviderName: string;
    },
    isLater: boolean,
    score: number  
}