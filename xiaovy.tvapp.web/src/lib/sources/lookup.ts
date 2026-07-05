// src/lib/sources/lookup.ts
// ソース横断でアイテムを (source, id) で引くヘルパ。

import type { SourceId, Item } from './types';
import { SOURCES } from './registry';

/**
 * 指定ソースの getHome() 全 Section から (source, id) 一致する Item を返す。
 * 見つからなければ null。
 */
export async function getItemByRef(
  source: SourceId,
  id: string,
): Promise<Item | null> {
  const adapter = SOURCES[source];
  if (!adapter) return null;

  const sections = await adapter.getHome();
  for (const section of sections) {
    for (const item of section.items) {
      if (item.source === source && item.id === id) {
        return item;
      }
    }
  }
  return null;
}
