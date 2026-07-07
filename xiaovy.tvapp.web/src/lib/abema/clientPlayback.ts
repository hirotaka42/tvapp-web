import { AbemaVodItem } from '@/types/abema/view';
import { auth } from '@/lib/firebase';

/** Read a bearer token for ABEMA BFF routes (dev bypass yields 'anonymous'). */
export async function getAbemaClientToken(): Promise<string> {
  if (typeof window !== 'undefined') {
    const tokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME || 'IdToken';
    const stored = window.localStorage.getItem(tokenName);
    if (stored) return stored;
  }
  const currentUser = auth?.currentUser;
  if (currentUser) return currentUser.getIdToken();
  return 'anonymous';
}

/** GET an ABEMA BFF route as JSON with the client bearer token. */
export async function fetchAbemaJson<T>(url: string): Promise<T> {
  const token = await getAbemaClientToken();
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

/**
 * Resolve a VOD ranking item (series/season) to the in-app watch path by finding
 * a playable episode id. Returns null when no episode can be resolved.
 */
export async function resolveAbemaWatchPath(
  item: Pick<AbemaVodItem, 'contentId' | 'contentType'>,
): Promise<string | null> {
  const token = await getAbemaClientToken();
  const params = new URLSearchParams({ contentId: item.contentId, contentType: item.contentType });
  const response = await fetch(`/api/service/abema/vod/episode?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const { episodeId } = (await response.json()) as { episodeId?: string };
  if (!episodeId) return null;
  return `/service/abema/watch/${encodeURIComponent(episodeId)}`;
}
