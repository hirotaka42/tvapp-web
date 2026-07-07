import { describe, expect, it } from 'vitest';
import { sectionAccentForLabel } from './sectionAccentForLabel';

describe('sectionAccentForLabel', () => {
  it('cycles accents by index', () => {
    expect(sectionAccentForLabel('総合', 0)).toBe('s-pink');
    expect(sectionAccentForLabel('ドラマ', 1)).toBe('s-yellow');
    expect(sectionAccentForLabel('六番目', 5)).toBe('s-pink');
  });

  it('is deterministic for the same index', () => {
    expect(sectionAccentForLabel('A', 3)).toBe(sectionAccentForLabel('B', 3));
  });
});
