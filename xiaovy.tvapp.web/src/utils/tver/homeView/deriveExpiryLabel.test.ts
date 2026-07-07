import { describe, expect, it } from 'vitest';
import { deriveExpiryLabel } from './deriveExpiryLabel';

const now = new Date('2026-07-07T10:00:00+09:00').getTime();

function unix(iso: string) {
  return Math.floor(new Date(iso).getTime() / 1000);
}

describe('deriveExpiryLabel', () => {
  it('returns a same-day JST label', () => {
    expect(deriveExpiryLabel(unix('2026-07-07T23:59:00+09:00'), now)).toBe('本日 23:59 終了');
  });

  it('returns ceil day labels', () => {
    expect(deriveExpiryLabel(unix('2026-07-09T09:00:00+09:00'), now)).toBe('あと2日');
  });

  it('returns null for zero, past, and far future', () => {
    expect(deriveExpiryLabel(0, now)).toBeNull();
    expect(deriveExpiryLabel(unix('2026-07-07T09:59:00+09:00'), now)).toBeNull();
    expect(deriveExpiryLabel(unix('2026-11-01T00:00:00+09:00'), now)).toBeNull();
  });

  it('uses JST day boundaries', () => {
    const boundaryNow = new Date('2026-07-07T23:50:00+09:00').getTime();
    expect(deriveExpiryLabel(unix('2026-07-08T00:10:00+09:00'), boundaryNow)).toBe('あと1日');
  });
});
