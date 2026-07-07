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

export interface RawAbemaThumb {
  urlPrefix?: string;
  filename?: string;
  query?: string;
  extension?: string;
  [key: string]: unknown;
}

export interface RawAbemaVodLabel {
  free?: boolean;
  newest?: boolean;
  [key: string]: unknown;
}

export interface RawAbemaModulesResponse {
  modules?: RawAbemaModule[];
  [key: string]: unknown;
}

export interface RawAbemaModule {
  id?: string;
  nameFormat?: string;
  name?: string;
  itemUiType?: string;
  items?: RawAbemaModuleItem[];
  [key: string]: unknown;
}

export interface RawAbemaModuleItem {
  contentId?: string;
  contentType?: string;
  title?: string;
  thumb?: RawAbemaThumb;
  label?: RawAbemaVodLabel;
  [key: string]: unknown;
}

export interface RawAbemaVideoGenresResponse {
  genres?: RawAbemaVideoGenre[];
  [key: string]: unknown;
}

export interface RawAbemaVideoGenre {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface RawAbemaVideoSeries {
  id?: string;
  version?: string | number;
  title?: string;
  content?: string;
  genre?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
  seasons?: RawAbemaVideoSeason[];
  orderedSeasons?: RawAbemaVideoSeason[];
  label?: RawAbemaVodLabel;
  thumbComponent?: RawAbemaThumb;
  [key: string]: unknown;
}

export interface RawAbemaVideoSeason {
  id?: string;
  sequence?: number;
  name?: string;
  order?: number;
  thumbComponent?: RawAbemaThumb;
  episodeGroups?: Array<{
    id?: string;
    name?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface RawAbemaVideoProgram {
  id?: string;
  series?: {
    id?: string;
    title?: string;
    label?: RawAbemaVodLabel;
    thumbComponent?: RawAbemaThumb;
    [key: string]: unknown;
  };
  season?: RawAbemaVideoSeason;
  genre?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
  episode?: {
    number?: number;
    sequence?: number;
    title?: string;
    content?: string;
    [key: string]: unknown;
  };
  label?: RawAbemaVodLabel;
  thumbComponent?: RawAbemaThumb;
  [key: string]: unknown;
}

export interface RawAbemaSeriesPrograms {
  programs?: RawAbemaSeriesProgram[];
  version?: string | number;
  [key: string]: unknown;
}

export interface RawAbemaSeriesProgram {
  id?: string;
  season?: RawAbemaVideoSeason;
  label?: RawAbemaVodLabel;
  sequence?: number;
  episode?: {
    number?: number;
    sequence?: number;
    title?: string;
    content?: string;
    [key: string]: unknown;
  };
  thumbComponent?: RawAbemaThumb;
  [key: string]: unknown;
}
