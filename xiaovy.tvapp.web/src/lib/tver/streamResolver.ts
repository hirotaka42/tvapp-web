/**
 * TVER ストリーム解決（純 TypeScript）
 *
 * 既存実装で Azure Functions + yt-dlp が担っていた「TVER エピソード → m3u8」の解決を、
 * 公開 API への素の fetch だけで完結させる。Cloudflare Workers / Node どちらでも動く
 * ように、外部依存を持たず fetch と現在時刻を注入可能にしている。
 *
 * 解決フロー(すべて公開 API):
 *   1) セッション: POST platform-api.tver.jp/v2/api/platform_users/browser/create
 *   2) Streaks キー: GET player.tver.jp/player/streaks_info_v2.json (月替わり key01..key06)
 *   3) エピソード情報: GET platform-api.tver.jp/service/api/v1/callEpisode/{id} → version
 *   4) 静的 JSON: GET statics.tver.jp/content/episode/{id}.json?v={version} → streaks 参照
 *   5) 再生情報: GET playback.api.streaks.jp/v1/projects/{proj}/medias/ref:{ref}
 *        ヘッダ Origin: https://tver.jp と X-Streaks-Api-Key が必須
 *   6) sources[] から非DRMの m3u8 を採用、tracks[] から字幕を抽出
 */

export type FetchFn = typeof fetch;

export interface TverSession {
  platformUid: string;
  platformToken: string;
}

export interface StreaksProjectInfo {
  api_key?: Record<string, string>;
  [key: string]: unknown;
}

export type StreaksInfo = Record<string, StreaksProjectInfo>;

export interface StaticContentVideo {
  videoRefID?: string;
  videoID?: string;
  accountID?: string;
  playerID?: string;
  channelID?: string;
}

export interface StaticContentStreaks {
  videoRefID?: string;
  mediaID?: string;
  projectID?: string;
}

export interface StaticContent {
  id: string;
  version?: number;
  video?: StaticContentVideo;
  streaks?: StaticContentStreaks;
  title?: string;
  description?: string;
  seriesID?: string;
  seasonID?: string;
  no?: number;
}

export interface ResolvedSubtitle {
  lang: string;
  url: string;
}

export interface ResolvedStream {
  /** 採用した m3u8 URL(先頭) */
  videoUrl: string;
  /** 取得できた m3u8 URL 全て(非DRM) */
  m3u8Urls: string[];
  subtitles: ResolvedSubtitle[];
  title?: string;
  duration?: number;
  backend: 'streaks';
}

/** 解決エラー(コード付き)。上位で HTTP ステータスに写像する。 */
export class TverResolveError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'TverResolveError';
    this.code = code;
  }
}
export class TverGeoRestrictedError extends TverResolveError {
  constructor(message = 'この地域からは視聴できません(日本国内限定)') {
    super('GEO_RESTRICTED', message);
    this.name = 'TverGeoRestrictedError';
  }
}
export class TverApiKeyError extends TverResolveError {
  constructor(message = 'Streaks API キーが無効か、Origin ヘッダが不正です') {
    super('API_KEY', message);
    this.name = 'TverApiKeyError';
  }
}
export class TverStreamNotFoundError extends TverResolveError {
  constructor(message = 'ストリームが見つかりません') {
    super('NOT_FOUND', message);
    this.name = 'TverStreamNotFoundError';
  }
}
export class TverUpstreamError extends TverResolveError {
  status: number;
  constructor(status: number, message: string) {
    super('UPSTREAM', message);
    this.name = 'TverUpstreamError';
    this.status = status;
  }
}

/** TVER の各エンドポイントに付与する共通ヘッダ。 */
const TVER_HEADERS: Record<string, string> = {
  'x-tver-platform-type': 'web',
  Origin: 'https://tver.jp',
  Referer: 'https://tver.jp/',
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

const M3U8_TYPES = new Set([
  'application/x-mpegurl',
  'application/vnd.apple.mpegurl',
]);

/**
 * 月替わりの Streaks API キーのスロット番号(1..6)を返す。
 * yt-dlp と同じく JST の月を用い、`(month % 6) || 6`。
 * 例: 7月→1(key01), 6月→6(key06), 12月→6(key06)。
 */
export function selectStreaksKeyIndex(now: Date = new Date()): number {
  const jstMonth = new Date(now.getTime() + 9 * 3600_000).getUTCMonth() + 1;
  return jstMonth % 6 || 6;
}

/** スロット番号から streaks_info のキー名(key01 等)を作る。 */
export function streaksKeyName(index: number): string {
  return `key0${index}`;
}

/** 1) セッション(platform_uid / platform_token)を発行する。 */
export async function createSession(fetchFn: FetchFn = fetch): Promise<TverSession> {
  const res = await fetchFn(
    'https://platform-api.tver.jp/v2/api/platform_users/browser/create',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
        Origin: 'https://s.tver.jp',
        Referer: 'https://s.tver.jp/',
      },
      body: 'device_type=pc',
    },
  );
  if (!res.ok) {
    throw new TverUpstreamError(res.status, `セッション作成に失敗しました (${res.status})`);
  }
  const json = (await res.json()) as {
    result?: { platform_uid?: string; platform_token?: string };
  };
  const platformUid = json.result?.platform_uid;
  const platformToken = json.result?.platform_token;
  if (!platformUid || !platformToken) {
    throw new TverUpstreamError(502, 'セッション応答に platform_uid/platform_token がありません');
  }
  return { platformUid, platformToken };
}

/** 2) Streaks のプロジェクト別 API キー表(月替わり)を取得する。呼び出し側でキャッシュ推奨。 */
export async function getStreaksInfo(fetchFn: FetchFn = fetch): Promise<StreaksInfo> {
  const res = await fetchFn('https://player.tver.jp/player/streaks_info_v2.json', {
    headers: { 'User-Agent': UA, Referer: 'https://tver.jp/' },
  });
  if (!res.ok) {
    throw new TverUpstreamError(res.status, `streaks_info の取得に失敗しました (${res.status})`);
  }
  return (await res.json()) as StreaksInfo;
}

/** 3) callEpisode から version を取得する(欠落時は '5')。 */
export async function getEpisodeVersion(
  episodeId: string,
  session: TverSession,
  fetchFn: FetchFn = fetch,
): Promise<string> {
  const q = new URLSearchParams({
    platform_uid: session.platformUid,
    platform_token: session.platformToken,
    require_data: 'mylist,later[epefy106ur],good[epefy106ur],resume[epefy106ur]',
  });
  const res = await fetchFn(
    `https://platform-api.tver.jp/service/api/v1/callEpisode/${encodeURIComponent(episodeId)}?${q}`,
    { headers: { ...TVER_HEADERS, 'User-Agent': UA } },
  );
  if (!res.ok) {
    // version は静的 JSON のキャッシュバスターに過ぎないため、失敗しても既定値で続行できる。
    return '5';
  }
  const json = (await res.json()) as {
    result?: { episode?: { content?: { version?: number | string } } };
  };
  const version = json.result?.episode?.content?.version;
  return version != null ? String(version) : '5';
}

/** 4) 静的コンテンツ JSON(streaks/brightcove 参照を含む)を取得する。 */
export async function getStaticContent(
  episodeId: string,
  version: string,
  fetchFn: FetchFn = fetch,
): Promise<StaticContent> {
  const res = await fetchFn(
    `https://statics.tver.jp/content/episode/${encodeURIComponent(episodeId)}.json?v=${encodeURIComponent(version)}`,
    { headers: { 'User-Agent': UA, Referer: 'https://tver.jp/' } },
  );
  if (!res.ok) {
    throw new TverUpstreamError(res.status, `エピソード静的情報の取得に失敗しました (${res.status})`);
  }
  return (await res.json()) as StaticContent;
}

interface StreaksSource {
  src?: string;
  type?: string;
  key_systems?: Record<string, unknown>;
}
interface StreaksTrack {
  kind?: string;
  src?: string;
  srclang?: string;
}
interface StreaksPlaybackResponse {
  id?: string;
  type?: string;
  name?: string;
  duration?: number;
  sources?: StreaksSource[];
  tracks?: StreaksTrack[];
}

/** 5)+6) Streaks playback API を叩き、非DRM の m3u8 と字幕を取り出す。 */
export async function resolveStreaksPlayback(
  projectId: string,
  mediaRef: string,
  apiKey: string,
  fetchFn: FetchFn = fetch,
): Promise<Pick<ResolvedStream, 'videoUrl' | 'm3u8Urls' | 'subtitles' | 'title' | 'duration' | 'backend'>> {
  const url = `https://playback.api.streaks.jp/v1/projects/${encodeURIComponent(projectId)}/medias/${mediaRef}`;
  const res = await fetchFn(url, {
    headers: {
      Accept: 'application/json',
      // Origin は tver.jp 必須。players.streaks.jp 等にすると 403(id 139)。
      Origin: 'https://tver.jp',
      Referer: 'https://tver.jp/',
      'User-Agent': UA,
      'X-Streaks-Api-Key': apiKey,
    },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      id?: number;
      code?: string;
      message?: string;
    };
    if (err.code === 'REQUEST_FAILED') {
      if (err.id === 124) throw new TverGeoRestrictedError();
      if (err.id === 126) throw new TverApiKeyError();
      // id 139 等: キーは受理されたが視聴不可(視聴期間外/Origin不一致など)
      throw new TverStreamNotFoundError(err.message || 'この動画は視聴できません');
    }
    if (err.code === 'MEDIA_NOT_FOUND') {
      throw new TverStreamNotFoundError(err.message || 'メディアが見つかりません');
    }
    throw new TverUpstreamError(res.status, err.message || `playback 取得失敗 (${res.status})`);
  }

  const json = (await res.json()) as StreaksPlaybackResponse;

  const m3u8Urls: string[] = [];
  let hadDrm = false;
  for (const source of json.sources ?? []) {
    if (!source?.src) continue;
    if (source.key_systems) {
      hadDrm = true;
      continue; // DRM は再生対象外
    }
    const ext = (source.type ?? '').split(';')[0].trim().toLowerCase();
    if (M3U8_TYPES.has(ext)) {
      m3u8Urls.push(source.src);
    }
  }

  if (m3u8Urls.length === 0) {
    throw new TverStreamNotFoundError(
      hadDrm ? 'この動画は DRM 保護されており再生できません' : '再生可能な m3u8 が見つかりません',
    );
  }

  const subtitles: ResolvedSubtitle[] = [];
  for (const track of json.tracks ?? []) {
    if ((track.kind === 'subtitles' || track.kind === 'captions') && track.src) {
      subtitles.push({ lang: (track.srclang || 'ja').toLowerCase(), url: track.src });
    }
  }

  return {
    videoUrl: m3u8Urls[0],
    m3u8Urls,
    subtitles,
    title: json.name,
    duration: json.duration,
    backend: 'streaks',
  };
}

export interface ResolveOptions {
  fetchFn?: FetchFn;
  now?: Date;
  /** 事前取得した streaks_info を渡すとネットワークを1回省ける(キャッシュ用途)。 */
  streaksInfo?: StreaksInfo;
  /** 事前発行のセッションを使い回す。 */
  session?: TverSession;
}

/**
 * TVER エピソード ID から再生用 m3u8 を解決するオーケストレータ。
 * 現行の主経路である Streaks に対応する(Brightcove のみの旧作は未対応)。
 */
export async function resolveEpisodeStream(
  episodeId: string,
  options: ResolveOptions = {},
): Promise<ResolvedStream> {
  if (!episodeId || !episodeId.trim()) {
    throw new TverResolveError('BAD_REQUEST', 'episodeId が必要です');
  }
  const fetchFn = options.fetchFn ?? fetch;
  const now = options.now ?? new Date();

  const [session, streaksInfo] = await Promise.all([
    options.session ? Promise.resolve(options.session) : createSession(fetchFn),
    options.streaksInfo ? Promise.resolve(options.streaksInfo) : getStreaksInfo(fetchFn),
  ]);

  const version = await getEpisodeVersion(episodeId, session, fetchFn);
  const content = await getStaticContent(episodeId, version, fetchFn);

  const streaks = content.streaks;
  const streaksRef = streaks?.videoRefID;
  if (!streaks?.projectID || !streaksRef) {
    // Streaks 参照が無い旧作(Brightcove のみ)は MVP 対象外。
    throw new TverStreamNotFoundError(
      'この作品は Streaks 配信ではありません(Brightcove のみの旧作は未対応)',
    );
  }

  const projectId = streaks.projectID;
  const mediaRef = streaksRef.startsWith('ref:') ? streaksRef : `ref:${streaksRef}`;

  const projectInfo = streaksInfo[projectId];
  const keyName = streaksKeyName(selectStreaksKeyIndex(now));
  const apiKey = projectInfo?.api_key?.[keyName];
  if (!apiKey) {
    throw new TverApiKeyError(
      `Streaks API キーが見つかりません (project=${projectId}, slot=${keyName})`,
    );
  }

  const playback = await resolveStreaksPlayback(projectId, mediaRef, apiKey, fetchFn);
  return {
    ...playback,
    // 静的 JSON 側にタイトルがあれば補完
    title: playback.title || content.title,
  };
}
