// src/lib/sources/mock.ts
// demo 用モックアダプタ。実 API は叩かず固定データを返す。
// TODO: creds/リゾルバ接続後に実アダプタへ差し替え(現在は mock)

import type {
  ContentSource,
  SourceId,
  AuthLevel,
  Item,
  Section,
  Episode,
  Series,
  StreamResult,
  Playability,
} from './types';

// ── ヘルパー ──

function item(
  source: SourceId,
  id: string,
  title: string,
  opts: Partial<Pick<Item, 'subtitle' | 'rank' | 'playability' | 'stream'>> = {},
): Item {
  return {
    source,
    id,
    title,
    thumbnailUrl: '',
    subtitle: opts.subtitle,
    rank: opts.rank,
    playability: opts.playability ?? 'playable',
    ...(opts.stream ? { stream: opts.stream } : {}),
  };
}

// ── TVer ──

const tverSections: Section[] = [
  {
    key: 'ranking-drama',
    label: 'ランキング — ドラマ',
    items: [
      item('tver', 'tv-d1', '海よりも深く', { subtitle: 'TVer', rank: 1 }),
      item('tver', 'tv-d2', '東京タワーの灯', { subtitle: 'TVer', rank: 2 }),
      item('tver', 'tv-d3', '半径5メートルの約束', { subtitle: 'TVer', rank: 3 }),
      item('tver', 'tv-d4', '朝がまた来る', { subtitle: 'TVer', rank: 4 }),
      item('tver', 'tv-d5', 'さよならの続き', { subtitle: 'TVer', rank: 5 }),
      item('tver', 'tv-d6', '路地裏カフェの秘密', { subtitle: 'TVer', rank: 6 }),
    ],
  },
  {
    key: 'ranking-variety',
    label: 'ランキング — バラエティ',
    items: [
      item('tver', 'tv-v1', '世界の果てまでクイズ旅', { subtitle: 'TVer', rank: 1 }),
      item('tver', 'tv-v2', '深夜食堂トーク', { subtitle: 'TVer', rank: 2 }),
      item('tver', 'tv-v3', 'ゴールデンアワー', { subtitle: 'TVer', rank: 3 }),
      item('tver', 'tv-v4', '月曜から元気!', { subtitle: 'TVer', rank: 4 }),
      item('tver', 'tv-v5', '芸能人キッチンバトル', { subtitle: 'TVer', rank: 5 }),
      item('tver', 'tv-v6', 'ドッキリグランプリ 傑作選', { subtitle: 'TVer', rank: 6 }),
    ],
  },
  {
    key: 'ranking-anime',
    label: 'ランキング — アニメ',
    items: [
      item('tver', 'tv-a1', '星降る夜のクロニクル', { subtitle: 'TVer', rank: 1 }),
      item('tver', 'tv-a2', 'ダンジョン飯 Season 2', { subtitle: 'TVer', rank: 2 }),
      item('tver', 'tv-a3', '青の錬金術師', { subtitle: 'TVer', rank: 3 }),
      item('tver', 'tv-a4', '最果ての魔法使い', { subtitle: 'TVer', rank: 4 }),
      item('tver', 'tv-a5', 'サイバーパンク東京 2099', { subtitle: 'TVer', rank: 5 }),
      item('tver', 'tv-a6', '転生したら猫だった件', { subtitle: 'TVer', rank: 6 }),
    ],
  },
];

export const tverSource: ContentSource = {
  id: 'tver',
  label: 'TVer',
  authLevel: 'anonymous' as AuthLevel,
  getHome: () => Promise.resolve(tverSections),
  getRanking: () => Promise.resolve(tverSections[0].items),
  search: () => Promise.resolve([]),
  getSeries: (seriesId: string) =>
    Promise.resolve({
      source: 'tver' as SourceId,
      id: seriesId,
      title: 'mock series',
      seasons: [],
    } satisfies Series),
  getEpisode: (episodeId: string) =>
    Promise.resolve({
      source: 'tver' as SourceId,
      id: episodeId,
      title: 'mock episode',
      playability: 'playable' as Playability,
    } satisfies Episode),
  resolveStream: () =>
    Promise.resolve({ kind: 'account-required' } satisfies StreamResult),
  playabilityOf: () => 'playable' as Playability,
};

// ── YouTube ──

const youtubeSections: Section[] = [
  {
    key: 'youtube-music-jp',
    label: '音楽ランキング(日本)',
    items: [
      item('youtube', 'yt-mj1', 'Subtitle / Official髭男dism', { subtitle: 'YouTube', rank: 1 }),
      item('youtube', 'yt-mj2', 'Lemon / 米津玄師', { subtitle: 'YouTube', rank: 2 }),
      item('youtube', 'yt-mj3', '新時代 / Ado', { subtitle: 'YouTube', rank: 3 }),
      item('youtube', 'yt-mj4', 'ドライフラワー / 優里', { subtitle: 'YouTube', rank: 4 }),
      item('youtube', 'yt-mj5', '怪獣の花唄 / Vaundy', { subtitle: 'YouTube', rank: 5 }),
      item('youtube', 'yt-mj6', 'きらり / 藤井 風', { subtitle: 'YouTube', rank: 6 }),
    ],
  },
  {
    key: 'youtube-music-global',
    label: '音楽ランキング(世界)',
    items: [
      item('youtube', 'kJQP7kiw5Fk', 'Despacito / Luis Fonsi ft. Daddy Yankee', { subtitle: 'YouTube', rank: 1, stream: { kind: 'youtube', videoId: 'kJQP7kiw5Fk' } }),
      item('youtube', '9bZkp7q19f0', 'GANGNAM STYLE / PSY', { subtitle: 'YouTube', rank: 2, stream: { kind: 'youtube', videoId: '9bZkp7q19f0' } }),
      item('youtube', 'RgKAFK5djSk', 'See You Again / Wiz Khalifa ft. Charlie Puth', { subtitle: 'YouTube', rank: 3, stream: { kind: 'youtube', videoId: 'RgKAFK5djSk' } }),
      item('youtube', 'OPf0YbXqDm0', 'Uptown Funk / Mark Ronson ft. Bruno Mars', { subtitle: 'YouTube', rank: 4, stream: { kind: 'youtube', videoId: 'OPf0YbXqDm0' } }),
      item('youtube', 'JGwWNGJdvx8', 'Shape of You / Ed Sheeran', { subtitle: 'YouTube', rank: 5, stream: { kind: 'youtube', videoId: 'JGwWNGJdvx8' } }),
      item('youtube', 'dQw4w9WgXcQ', 'Never Gonna Give You Up / Rick Astley', { subtitle: 'YouTube', rank: 6, stream: { kind: 'youtube', videoId: 'dQw4w9WgXcQ' } }),
    ],
  },
  {
    key: 'youtube-movie',
    label: '映画情報・予告',
    items: [
      item('youtube', 'yt-mv1', '君たちはどう生きるか 制作の裏側', { subtitle: 'YouTube' }),
      item('youtube', 'yt-mv2', 'Mission: Impossible 8 最終予告', { subtitle: 'YouTube' }),
      item('youtube', 'yt-mv3', 'ゴジラ新作 ティザー映像', { subtitle: 'YouTube' }),
      item('youtube', 'yt-mv4', 'ブレードランナー 2099 公式予告', { subtitle: 'YouTube' }),
      item('youtube', 'yt-mv5', 'ワンピース実写版 Season 3 予告', { subtitle: 'YouTube' }),
      item('youtube', 'yt-mv6', 'スパイダーバース 続編 特報', { subtitle: 'YouTube' }),
    ],
  },
  {
    key: 'youtube-news',
    label: 'ニュース',
    items: [
      item('youtube', 'yt-nw1', '今日の主要ニュースまとめ', { subtitle: 'YouTube' }),
      item('youtube', 'yt-nw2', '経済ニュース 市場動向', { subtitle: 'YouTube' }),
      item('youtube', 'yt-nw3', '国際情勢 週間レポート', { subtitle: 'YouTube' }),
      item('youtube', 'yt-nw4', 'テクノロジー最前線', { subtitle: 'YouTube' }),
      item('youtube', 'yt-nw5', '気象情報 週間天気予報', { subtitle: 'YouTube' }),
      item('youtube', 'yt-nw6', 'スポーツハイライト', { subtitle: 'YouTube' }),
    ],
  },
  {
    key: 'youtube-ai',
    label: 'AI 関連',
    items: [
      item('youtube', 'yt-ai1', 'Claude 4 の全貌を解説', { subtitle: 'YouTube' }),
      item('youtube', 'yt-ai2', 'ローカル LLM 最新ベンチマーク比較', { subtitle: 'YouTube' }),
      item('youtube', 'yt-ai3', 'Stable Diffusion 実践ガイド', { subtitle: 'YouTube' }),
      item('youtube', 'yt-ai4', 'AI エージェント開発入門', { subtitle: 'YouTube' }),
      item('youtube', 'yt-ai5', 'RAG パイプライン構築ハンズオン', { subtitle: 'YouTube' }),
      item('youtube', 'yt-ai6', 'AI と著作権の最新議論', { subtitle: 'YouTube' }),
    ],
  },
];

export const youtubeSource: ContentSource = {
  id: 'youtube',
  label: 'YouTube',
  authLevel: 'anonymous' as AuthLevel,
  getHome: () => Promise.resolve(youtubeSections),
  getRanking: () => Promise.resolve(youtubeSections[0].items),
  search: () => Promise.resolve([]),
  getSeries: (seriesId: string) =>
    Promise.resolve({
      source: 'youtube' as SourceId,
      id: seriesId,
      title: 'mock series',
      seasons: [],
    } satisfies Series),
  getEpisode: (episodeId: string) =>
    Promise.resolve({
      source: 'youtube' as SourceId,
      id: episodeId,
      title: 'mock episode',
      playability: 'playable' as Playability,
    } satisfies Episode),
  resolveStream: () =>
    Promise.resolve({ kind: 'account-required' } satisfies StreamResult),
  playabilityOf: () => 'playable' as Playability,
};

// ── ABEMA ──

const abemaSections: Section[] = [
  {
    key: 'abema-catchup',
    label: '見逃し',
    items: [
      item('abema', 'ab-c1', '恋愛リアリティ SEASON 5', { subtitle: 'ABEMA' }),
      item('abema', 'ab-c2', 'ABEMA Prime 特集', { subtitle: 'ABEMA' }),
      item('abema', 'ab-c3', '格闘技 RIZIN ハイライト (権利作品)', {
        subtitle: 'ABEMA',
        playability: 'drm-unplayable',
      }),
      item('abema', 'ab-c4', '将棋チャンネル 名局集', { subtitle: 'ABEMA' }),
      item('abema', 'ab-c5', 'K-POP ライブ特番', { subtitle: 'ABEMA' }),
      item('abema', 'ab-c6', 'アニメ 一挙放送 (権利作品)', {
        subtitle: 'ABEMA',
        playability: 'drm-unplayable',
      }),
    ],
  },
  {
    key: 'abema-linear',
    label: 'リニア(24hチャンネル)',
    items: [
      item('abema', 'ab-l1', 'ABEMA NEWS 24', { subtitle: 'ABEMA' }),
      item('abema', 'ab-l2', 'アニメ LIVE チャンネル', { subtitle: 'ABEMA' }),
      item('abema', 'ab-l3', 'ドラマチャンネル', { subtitle: 'ABEMA' }),
      item('abema', 'ab-l4', '格闘チャンネル', { subtitle: 'ABEMA' }),
      item('abema', 'ab-l5', '将棋チャンネル', { subtitle: 'ABEMA' }),
      item('abema', 'ab-l6', 'K-WORLD チャンネル', { subtitle: 'ABEMA' }),
    ],
  },
];

export const abemaSource: ContentSource = {
  id: 'abema',
  label: 'ABEMA',
  authLevel: 'account' as AuthLevel,
  getHome: () => Promise.resolve(abemaSections),
  getRanking: () => Promise.resolve(abemaSections[0].items),
  search: () => Promise.resolve([]),
  getSeries: (seriesId: string) =>
    Promise.resolve({
      source: 'abema' as SourceId,
      id: seriesId,
      title: 'mock series',
      seasons: [],
    } satisfies Series),
  getEpisode: (episodeId: string) =>
    Promise.resolve({
      source: 'abema' as SourceId,
      id: episodeId,
      title: 'mock episode',
      playability: 'playable' as Playability,
    } satisfies Episode),
  resolveStream: () =>
    Promise.resolve({ kind: 'account-required' } satisfies StreamResult),
  playabilityOf: (i: Item) => i.playability,
};

// ── ニコニコ ──

const niconicoSections: Section[] = [
  {
    key: 'niconico-popular',
    label: '人気',
    items: [
      item('niconico', 'nc-p1', 'ボカロ新曲メドレー 2026夏', { subtitle: 'ニコニコ', rank: 1 }),
      item('niconico', 'nc-p2', '技術部 自作キーボード制作記', { subtitle: 'ニコニコ', rank: 2 }),
      item('niconico', 'nc-p3', 'ゲーム実況 RTAまとめ', { subtitle: 'ニコニコ', rank: 3 }),
      item('niconico', 'nc-p4', '料理動画 夏の冷製パスタ', { subtitle: 'ニコニコ', rank: 4 }),
      item('niconico', 'nc-p5', 'MMD 最新作品集', { subtitle: 'ニコニコ', rank: 5 }),
      item('niconico', 'nc-p6', '歌ってみた 夏の名曲カバー', { subtitle: 'ニコニコ', rank: 6 }),
    ],
  },
];

export const niconicoSource: ContentSource = {
  id: 'niconico',
  label: 'ニコニコ',
  authLevel: 'anonymous' as AuthLevel,
  getHome: () => Promise.resolve(niconicoSections),
  getRanking: () => Promise.resolve(niconicoSections[0].items),
  search: () => Promise.resolve([]),
  getSeries: (seriesId: string) =>
    Promise.resolve({
      source: 'niconico' as SourceId,
      id: seriesId,
      title: 'mock series',
      seasons: [],
    } satisfies Series),
  getEpisode: (episodeId: string) =>
    Promise.resolve({
      source: 'niconico' as SourceId,
      id: episodeId,
      title: 'mock episode',
      playability: 'playable' as Playability,
    } satisfies Episode),
  resolveStream: () =>
    Promise.resolve({ kind: 'account-required' } satisfies StreamResult),
  playabilityOf: () => 'playable' as Playability,
};
