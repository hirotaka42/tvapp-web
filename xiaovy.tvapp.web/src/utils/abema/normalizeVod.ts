import { RawAbemaModule, RawAbemaModuleItem, RawAbemaModulesResponse, RawAbemaThumb } from '@/types/abema/rawApi';
import { AbemaVodItem, AbemaVodShelf } from '@/types/abema/view';

function buildThumbnailUrl(thumb?: RawAbemaThumb): string | undefined {
  if (!thumb?.urlPrefix || !thumb.filename) {
    return undefined;
  }
  const base = `${thumb.urlPrefix}/${thumb.filename}`;
  return thumb.query ? `${base}?${thumb.query}` : base;
}

export function normalizeVodItem(raw: RawAbemaModuleItem): AbemaVodItem | null {
  if (!raw.contentId || !raw.contentType || !raw.title) {
    return null;
  }

  return {
    contentId: raw.contentId,
    contentType: raw.contentType,
    title: raw.title,
    thumbnailUrl: buildThumbnailUrl(raw.thumb),
    isFree: raw.label?.free === true ? true : undefined,
  };
}

export function normalizeVodShelf(raw: RawAbemaModule): AbemaVodShelf | null {
  const title = raw.nameFormat || raw.name;
  if (!title) {
    return null;
  }

  const items = (raw.items ?? [])
    .map(normalizeVodItem)
    .filter((item): item is AbemaVodItem => item !== null);

  return {
    key: raw.id || title,
    title,
    uiType: raw.itemUiType,
    items,
  };
}

export function normalizeVod(raw: RawAbemaModulesResponse): AbemaVodShelf[] {
  return (raw.modules ?? [])
    .map(normalizeVodShelf)
    .filter((shelf): shelf is AbemaVodShelf => shelf !== null);
}
