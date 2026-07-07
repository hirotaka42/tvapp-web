export interface AbemaChannel {
  id: string;
  name: string;
  gnid?: string;
  hls?: string;
  dash?: string;
  watchUrl: string;
}

export interface AbemaSlot {
  id: string;
  channelId: string;
  title: string;
  startAt: number;
  endAt: number;
  startMs: number;
  endMs: number;
  content?: string;
  highlight?: string;
  detailHighlight?: string;
  labels: string[];
  thumbKey: `ag${number}`;
  watchUrl: string;
  timeshiftEndAt?: number;
  timeshiftFreeEndAt?: number;
}

export interface AbemaLiveSlot extends AbemaSlot {
  progressPercent: number;
}

export interface AbemaEpgGrid {
  window: {
    startMs: number;
    endMs: number;
  };
  columns: Array<{
    label: string;
    startMs: number;
  }>;
  rows: AbemaEpgRow[];
  nowPercent: number;
}

export interface AbemaEpgRow {
  channel: AbemaChannel;
  cells: AbemaEpgCell[];
}

export interface AbemaEpgCell {
  slot: AbemaSlot;
  colStart: number;
  colSpan: number;
  isLive: boolean;
}

export interface AbemaShelf {
  key: string;
  title: string;
  note: string;
  items: AbemaSlot[];
}

export interface AbemaTickerItem {
  id: string;
  badge: string;
  badgeVariant: 'live' | 'reserve';
  text: string;
}

export interface AbemaVodItem {
  contentId: string;
  contentType: string;
  title: string;
  thumbnailUrl?: string;
  isFree?: boolean;
  isPremium?: boolean;
}

export interface AbemaVodShelf {
  key: string;
  title: string;
  uiType?: string;
  items: AbemaVodItem[];
}

export interface AbemaProgramInfo {
  id: string;
  seriesId?: string;
  seriesTitle?: string;
  seasonId?: string;
  seasonName?: string;
  seasonSequence?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  description?: string;
  thumbnailUrl?: string;
  genreName?: string;
  isFree?: boolean;
  isPremium?: boolean;
}

export interface AbemaSeasonGroup {
  id: string;
  name: string;
  sequence?: number;
  episodes: Array<{
    id: string;
    number?: number;
    title?: string;
    isFree?: boolean;
    isPremium?: boolean;
    thumbnailUrl?: string;
  }>;
}

export interface AbemaSeriesDetail {
  id: string;
  title: string;
  description?: string;
  genreName?: string;
  thumbnailUrl?: string;
  seasons: AbemaSeasonGroup[];
}
