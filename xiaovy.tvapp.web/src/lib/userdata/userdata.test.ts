// src/lib/userdata/userdata.test.ts
// localStorage ベースのお気に入り・履歴の検証。
// vitest environment=node なので localStorage を最小モックする。

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Item } from '@/lib/sources/types';

// ── localStorage mock ──

const store: Record<string, string> = {};

vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
});

import {
  toggleFavorite,
  isFavorite,
  listFavorites,
  recordHistory,
  listHistory,
} from './local';

function makeItem(id: string, title: string): Item {
  return {
    source: 'youtube',
    id,
    title,
    playability: 'playable',
  };
}

describe('Favorites', () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  });

  it('toggleFavorite adds and removes', () => {
    const item = makeItem('a', 'Title A');
    expect(isFavorite('youtube', 'a')).toBe(false);

    toggleFavorite(item);
    expect(isFavorite('youtube', 'a')).toBe(true);
    expect(listFavorites()).toHaveLength(1);

    toggleFavorite(item);
    expect(isFavorite('youtube', 'a')).toBe(false);
    expect(listFavorites()).toHaveLength(0);
  });

  it('multiple favorites', () => {
    toggleFavorite(makeItem('a', 'A'));
    toggleFavorite(makeItem('b', 'B'));
    expect(listFavorites()).toHaveLength(2);
  });
});

describe('History', () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  });

  it('recordHistory adds to front', () => {
    recordHistory(makeItem('a', 'A'));
    recordHistory(makeItem('b', 'B'));
    const h = listHistory();
    expect(h).toHaveLength(2);
    expect(h[0].id).toBe('b');
    expect(h[1].id).toBe('a');
  });

  it('duplicate moves to front', () => {
    recordHistory(makeItem('a', 'A'));
    recordHistory(makeItem('b', 'B'));
    recordHistory(makeItem('a', 'A'));
    const h = listHistory();
    expect(h).toHaveLength(2);
    expect(h[0].id).toBe('a');
    expect(h[1].id).toBe('b');
  });

  it('limit is 50', () => {
    for (let i = 0; i < 60; i++) {
      recordHistory(makeItem(`i${i}`, `Item ${i}`));
    }
    expect(listHistory()).toHaveLength(50);
  });
});
