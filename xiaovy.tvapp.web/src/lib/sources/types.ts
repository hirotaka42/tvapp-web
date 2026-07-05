// src/lib/sources/types.ts
//
// マルチソース視聴の共通抽象。各ソース(TVer / ABEMA / YouTube / ニコニコ)は
// この ContentSource インターフェースを実装する「アダプタ」として Next.js の
// API ルート内に置く。発見(カタログ)はソース別に実装し、再生解決(resolveStream)は
// 共通の yt-dlp リゾルバ(Platform-Stream-Loader / Azure Functions)へ委譲する。
//
// 設計根拠: 基本設計「ソースアダプタ設計」/ 要件定義 F-02・F-03。
// - 統一するもの: アカウント・お気に入り・履歴・検索・外枠。
// - ソース別に分けるもの: カタログ・セッション・再生解決・再生可否。

/** 取り込み対象のソース識別子。yt-dlp 対応サイトを増やす際はここに追加する。 */
export type SourceId = 'tver' | 'abema' | 'youtube' | 'niconico';

/** 認証レベル。匿名で見られるか、アカウント/ログインが要るか。 */
export type AuthLevel = 'anonymous' | 'account';

/**
 * 再生可否。DRM(Widevine 等)で保護された作品は一覧には出すが再生できないため
 * 'drm-unplayable' として扱い、UI 側で「再生不可(メタのみ)」を明示する。
 */
export type Playability = 'playable' | 'drm-unplayable' | 'account-required';

/** ソースをまたいで一意にコンテンツを指す複合キー。 */
export interface ContentRef {
  source: SourceId;
  /** ソース内のコンテンツ ID(エピソード / 動画)。 */
  id: string;
}

/** 一覧カード1件。発見・検索・ランキングで共通に使う最小形。 */
export interface Item extends ContentRef {
  seriesId?: string;
  title: string;
  thumbnailUrl?: string;
  /** シリーズ名・チャンネル名などの補足。 */
  subtitle?: string;
  /** ランキング順位(ある場合)。 */
  rank?: number;
  playability: Playability;
  /** 実再生ソース。再生可能な項目だけ持つ。 */
  stream?: { kind: 'youtube'; videoId: string };
}

/** 発見ホーム等の「1 列」。key はキュレーションの識別子。 */
export interface Section {
  /** 例: 'ranking-drama' / 'youtube-music-jp' / 'cross-recommended'。 */
  key: string;
  label: string;
  items: Item[];
}

export interface Episode extends Item {
  description?: string;
  durationSec?: number;
  seriesTitle?: string;
}

export interface Series {
  source: SourceId;
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  seasons: SeriesSeason[];
}

export interface SeriesSeason {
  label: string;
  episodes: Episode[];
}

/** 再生解決の結果。playable のときだけ再生 URL を返す。 */
export type StreamResult =
  | { kind: 'playable'; url: string; mimeType?: string }
  | { kind: 'drm-unplayable' }
  | { kind: 'account-required' };

/**
 * ソースアダプタの共通契約。
 * 各ソースはこれを実装し、レジストリ(sources/index.ts)から SourceId で引く。
 */
export interface ContentSource {
  readonly id: SourceId;
  readonly label: string;
  readonly authLevel: AuthLevel;

  // ── 発見(カタログ) ──
  /** ホームに並べるキュレーション列。 */
  getHome(): Promise<Section[]>;
  /** ジャンル別ランキング。 */
  getRanking(genre: string): Promise<Item[]>;
  /** キーワード検索(第一級機能)。 */
  search(query: string): Promise<Item[]>;
  /** シリーズ詳細(シーズン別エピソード)。 */
  getSeries(seriesId: string): Promise<Series>;
  /** エピソード詳細。 */
  getEpisode(episodeId: string): Promise<Episode>;

  // ── 再生解決(共通 yt-dlp リゾルバへ委譲) ──
  resolveStream(ref: ContentRef): Promise<StreamResult>;

  // ── 能力 ──
  /** 与えられた item がこのソースで再生可能かを返す(DRM 判定含む)。 */
  playabilityOf(item: Item): Playability;
}
