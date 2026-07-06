import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatExpiryDate, getExpiryStatus, getSasExpiryDate } from './formatExpiryDate';

const video = (expiryDate?: string) => ({
  sas: expiryDate ? { new: { expiry_date: expiryDate } } : undefined,
});

describe('formatExpiryDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-07T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('SAS の新形式から有効期限を取得する', () => {
    expect(getSasExpiryDate(video('2026-07-08T00:00:00Z') as any)).toBe('2026-07-08T00:00:00Z');
    expect(getSasExpiryDate({} as any)).toBeNull();
  });

  it('期限なし、期限切れ、翌日、短期、長期の表示を返す', () => {
    expect(formatExpiryDate({} as any)).toBe('期限情報なし');
    expect(formatExpiryDate(video('2026-07-06T00:00:00Z') as any)).toBe('期限切れ');
    expect(formatExpiryDate(video('2026-07-08T00:00:00Z') as any)).toContain('明日まで');
    expect(formatExpiryDate(video('2026-07-12T00:00:00Z') as any)).toContain('あと5日');
    expect(formatExpiryDate(video('2026-08-20T00:00:00Z') as any)).toContain('2026年8月20日まで');
  });

  it('有効期限の状態を expired / warning / normal に分類する', () => {
    expect(getExpiryStatus({} as any)).toBe('normal');
    expect(getExpiryStatus(video('2026-07-06T00:00:00Z') as any)).toBe('expired');
    expect(getExpiryStatus(video('2026-07-09T00:00:00Z') as any)).toBe('warning');
    expect(getExpiryStatus(video('2026-07-20T00:00:00Z') as any)).toBe('normal');
  });
});
