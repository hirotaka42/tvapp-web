import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate, formatDateTime, formatRelativeTime } from './dateFormatter';

describe('dateFormatter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-07T12:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Date と文字列の日付を日本語ロケールで整形する', () => {
    expect(formatDate(new Date('2026-01-02T03:04:05+09:00'))).toContain('2026');
    expect(formatDate('2026-01-02T03:04:05+09:00')).toContain('01');
    expect(formatDateTime(new Date('2026-01-02T03:04:05+09:00'))).toContain('03');
  });

  it('相対時刻を境界ごとに返す', () => {
    expect(formatRelativeTime(new Date('2026-07-07T11:59:30+09:00'))).toBe('たった今');
    expect(formatRelativeTime(new Date('2026-07-07T11:55:00+09:00'))).toBe('5分前');
    expect(formatRelativeTime(new Date('2026-07-07T10:00:00+09:00'))).toBe('2時間前');
    expect(formatRelativeTime(new Date('2026-07-05T12:00:00+09:00'))).toBe('2日前');
  });

  it('7日以上前は日付表示にフォールバックする', () => {
    expect(formatRelativeTime('2026-06-20T12:00:00+09:00')).toBe(formatDate('2026-06-20T12:00:00+09:00'));
  });
});
