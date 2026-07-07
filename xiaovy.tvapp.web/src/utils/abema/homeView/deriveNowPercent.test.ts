import { describe, expect, it } from 'vitest';
import { deriveNowPercent } from './deriveNowPercent';

describe('deriveNowPercent', () => {
  it('clamps percent into the visible window', () => {
    expect(deriveNowPercent({ startMs: 100, endMs: 200 }, 50)).toBe(0);
    expect(deriveNowPercent({ startMs: 100, endMs: 200 }, 150)).toBe(50);
    expect(deriveNowPercent({ startMs: 100, endMs: 200 }, 250)).toBe(100);
  });

  it('handles invalid windows', () => {
    expect(deriveNowPercent({ startMs: 200, endMs: 100 }, 150)).toBe(0);
  });
});
