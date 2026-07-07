import { describe, expect, it } from 'vitest';
import { canPlayNativeHls } from './canPlayNativeHls';

describe('canPlayNativeHls', () => {
  it.each(['probably', 'maybe'])('treats %s as native HLS support', (result) => {
    expect(canPlayNativeHls(result)).toBe(true);
  });

  it.each(['', 'no', undefined, null])('rejects unsupported result %s', (result) => {
    expect(canPlayNativeHls(result)).toBe(false);
  });
});
