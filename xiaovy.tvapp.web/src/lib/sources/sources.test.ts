// src/lib/sources/sources.test.ts
// ソースレジストリ・モックデータ・lookup の検証。

import { describe, it, expect } from 'vitest';
import { SOURCES, SOURCE_LIST } from './registry';
import { getItemByRef } from './lookup';

describe('SOURCE_LIST', () => {
  it('4 ソースが登録されている', () => {
    expect(SOURCE_LIST).toHaveLength(4);
    const ids = SOURCE_LIST.map((s) => s.id);
    expect(ids).toEqual(['tver', 'abema', 'youtube', 'niconico']);
  });
});

describe('各ソースの getHome()', () => {
  for (const { id } of SOURCE_LIST) {
    it(`${id} は非空の Section を返す`, async () => {
      const sections = await SOURCES[id].getHome();
      expect(sections.length).toBeGreaterThan(0);
      for (const section of sections) {
        expect(section.items.length).toBeGreaterThan(0);
      }
    });
  }
});

describe('YouTube 音楽ランキング(世界)', () => {
  it('セクションが存在し、全 item が stream.kind==="youtube" で videoId が 11 文字', async () => {
    const sections = await SOURCES.youtube.getHome();
    const global = sections.find((s) => s.key === 'youtube-music-global');
    expect(global).toBeDefined();

    for (const item of global!.items) {
      expect(item.stream).toBeDefined();
      expect(item.stream!.kind).toBe('youtube');
      expect(item.stream!.videoId).toHaveLength(11);
    }
  });
});

describe('getItemByRef', () => {
  it('kJQP7kiw5Fk で Despacito を返す', async () => {
    const item = await getItemByRef('youtube', 'kJQP7kiw5Fk');
    expect(item).not.toBeNull();
    expect(item!.title).toContain('Despacito');
  });

  it('存在しない id は null を返す', async () => {
    const item = await getItemByRef('youtube', 'nonexistent_id');
    expect(item).toBeNull();
  });
});
