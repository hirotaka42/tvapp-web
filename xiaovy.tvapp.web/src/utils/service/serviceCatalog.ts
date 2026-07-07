export type ServiceId = 'tver' | 'abema' | 'youtube' | 'niconico';

export interface ServiceMeta {
  id: ServiceId;
  label: string;
  panelId: string;
  accent: string;
  accentInk: string;
  hint: '1' | '2' | '3' | '4';
  ready: boolean;
  searchPlaceholder: string;
}

export const SERVICES: ServiceMeta[] = [
  {
    id: 'tver',
    label: 'TVER',
    panelId: 'tv',
    accent: '#ffd400',
    accentInk: '#111008',
    hint: '1',
    ready: true,
    searchPlaceholder: '番組名・出演者・キーワードで検索',
  },
  {
    id: 'abema',
    label: 'ABEMA',
    panelId: 'ab',
    accent: '#17e087',
    accentInk: '#02180d',
    hint: '2',
    ready: true,
    searchPlaceholder: 'ABEMAの番組を検索',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    panelId: 'yt',
    accent: '#ff0033',
    accentInk: '#ffffff',
    hint: '3',
    ready: false,
    searchPlaceholder: 'YouTubeの動画を検索',
  },
  {
    id: 'niconico',
    label: 'niconico',
    panelId: 'nc',
    accent: '#ff8c1a',
    accentInk: '#2c1602',
    hint: '4',
    ready: false,
    searchPlaceholder: 'niconicoの動画を検索',
  },
];

export function isServiceId(value: string | null | undefined): value is ServiceId {
  return SERVICES.some((service) => service.id === value);
}

export function getServiceMeta(service: ServiceId): ServiceMeta {
  return SERVICES.find((item) => item.id === service) ?? SERVICES[0];
}

export function isReady(service: ServiceId): boolean {
  return getServiceMeta(service).ready;
}
