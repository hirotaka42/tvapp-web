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
