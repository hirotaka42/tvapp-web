// src/utils/dateFormatter.ts

/**
 * 日時をフォーマットして返す
 * @param date - Date オブジェクトまたは日時文字列
 * @returns フォーマットされた日時文字列 (例: "2025-01-16 14:30")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * 日付をフォーマットして返す
 * @param date - Date オブジェクトまたは日付文字列
 * @returns フォーマットされた日付文字列 (例: "2025-01-16")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}
