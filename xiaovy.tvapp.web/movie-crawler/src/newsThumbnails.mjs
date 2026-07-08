import { fetchText } from './fetcher.mjs';
import { parseOpenGraphImage } from './htmlParsers.mjs';

export async function enrichNewsThumbnails(newsItems, {
  limit = 30,
  fetchArticleText = fetchText,
} = {}) {
  const targets = new Set([...newsItems]
    .filter((item) => item.url)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit)
    .map((item) => item.guid));

  const enriched = [];
  for (const item of newsItems) {
    if (!targets.has(item.guid)) {
      enriched.push(item);
      continue;
    }

    let thumbnailUrl = null;
    try {
      thumbnailUrl = parseOpenGraphImage(await fetchArticleText(item.url), item.url);
    } catch {
      thumbnailUrl = null;
    }
    enriched.push({ ...item, thumbnailUrl });
  }
  return enriched;
}
