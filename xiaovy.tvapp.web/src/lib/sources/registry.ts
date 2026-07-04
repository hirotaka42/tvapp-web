// src/lib/sources/registry.ts
// ソースアダプタのレジストリ。SourceId で引く。

import type { ContentSource, SourceId } from './types';
import { tverSource, abemaSource, youtubeSource, niconicoSource } from './mock';

/** 全ソースを SourceId で引けるマップ */
export const SOURCES: Record<SourceId, ContentSource> = {
  tver: tverSource,
  abema: abemaSource,
  youtube: youtubeSource,
  niconico: niconicoSource,
};

/** UI 表示順(タブ等) */
export const SOURCE_LIST: { id: SourceId; label: string }[] = [
  { id: 'tver', label: 'TVer' },
  { id: 'abema', label: 'ABEMA' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'niconico', label: 'ニコニコ' },
];
