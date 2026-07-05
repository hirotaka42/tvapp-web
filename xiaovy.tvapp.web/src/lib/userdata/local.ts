// src/lib/userdata/local.ts
// お気に入り / 視聴履歴のクライアントローカル実装(localStorage)。
// TODO: Firebase 認証接続後、この層を Firestore バックエンドに差し替える
//       (users/{uid}/favorites・watchHistory)。

import type { Item, SourceId } from '@/lib/sources/types';

// ── 型 ──

/** localStorage に保存する最小表現 */
interface StoredItem {
  source: SourceId;
  id: string;
  title: string;
  subtitle?: string;
}

// ── 定数 ──

const FAVORITES_KEY = 'tvapp.favorites';
const HISTORY_KEY = 'tvapp.history';
const HISTORY_LIMIT = 50;

// ── ストレージ I/O(SSR 安全) ──

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function readList(key: string): StoredItem[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as StoredItem[];
  } catch {
    return [];
  }
}

function writeList(key: string, items: StoredItem[]): void {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(items));
}

function toStored(item: Item): StoredItem {
  return { source: item.source, id: item.id, title: item.title, subtitle: item.subtitle };
}

// ── お気に入り ──

export function toggleFavorite(item: Item): void {
  const list = readList(FAVORITES_KEY);
  const idx = list.findIndex((f) => f.source === item.source && f.id === item.id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(toStored(item));
  }
  writeList(FAVORITES_KEY, list);
}

export function isFavorite(source: SourceId, id: string): boolean {
  return readList(FAVORITES_KEY).some((f) => f.source === source && f.id === id);
}

export function listFavorites(): StoredItem[] {
  return readList(FAVORITES_KEY);
}

// ── 視聴履歴 ──

export function recordHistory(item: Item): void {
  const list = readList(HISTORY_KEY);
  // 重複は削除して先頭に移動
  const filtered = list.filter((h) => !(h.source === item.source && h.id === item.id));
  filtered.unshift(toStored(item));
  // 上限
  writeList(HISTORY_KEY, filtered.slice(0, HISTORY_LIMIT));
}

export function listHistory(): StoredItem[] {
  return readList(HISTORY_KEY);
}
