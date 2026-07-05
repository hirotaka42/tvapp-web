import { getStreaksInfo, type StreaksInfo, type FetchFn } from './streamResolver';

/**
 * streaks_info_v2.json の軽量キャッシュ。
 * 中身は key01..key06 を全て含むため、月替わりのキー選択は解決時に月から算出する。
 * よってこの JSON 自体は数時間キャッシュして問題ない(ネットワーク往復を1回省く)。
 * サーバーレス(Workers/Node)の各アイソレート内で有効なメモリキャッシュ。
 */
let cache: { info: StreaksInfo; at: number } | null = null;
const TTL_MS = 6 * 3600_000; // 6時間

export async function getStreaksInfoCached(
  fetchFn: FetchFn = fetch,
  now: number = Date.now(),
): Promise<StreaksInfo> {
  if (cache && now - cache.at < TTL_MS) {
    return cache.info;
  }
  const info = await getStreaksInfo(fetchFn);
  cache = { info, at: now };
  return info;
}

/** テスト用: キャッシュを初期化する。 */
export function resetStreaksInfoCache(): void {
  cache = null;
}
