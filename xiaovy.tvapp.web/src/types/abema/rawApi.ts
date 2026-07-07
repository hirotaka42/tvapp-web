export interface RawAbemaChannelsResponse {
  channels?: RawAbemaChannel[];
  [key: string]: unknown;
}

export interface RawAbemaChannel {
  id?: string;
  name?: string;
  gnid?: string;
  playback?: {
    hls?: string;
    dash?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RawAbemaSlotsResponse {
  slots?: RawAbemaSlot[];
  [key: string]: unknown;
}

export interface RawAbemaSlot {
  id?: string;
  title?: string;
  startAt?: number;
  endAt?: number;
  channelId?: string;
  highlight?: string;
  detailHighlight?: string;
  content?: string;
  thumbnails?: {
    default?: string;
    scenes?: Array<{
      id?: string;
      version?: string | number;
      name?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  timeshiftEndAt?: number;
  timeshiftFreeEndAt?: number;
  credit?: {
    casts?: string[];
    crews?: string[];
    copyrights?: string[];
    [key: string]: unknown;
  };
  labels?: string[];
  shares?: {
    links?: {
      [key: string]: string | undefined;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
