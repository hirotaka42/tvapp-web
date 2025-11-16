// src/utils/dateFormatter.ts

/**
 * 日時をフォーマットして返す
 * @param date - Date オブジェクトまたは日時文字列
 * @returns フォーマットされた日時文字列 (例: "2025年01月16日 15:48:21")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

/**
 * 日付をフォーマットして返す
 * @param date - Date オブジェクトまたは日付文字列
 * @returns フォーマットされた日付文字列 (例: "2025年01月16日")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * 相対時間表示 (「○分前」形式)
 * @param date - Date オブジェクトまたは日付文字列
 * @returns 相対時間文字列 (例: "5分前", "2時間前", "3日前")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;

  return formatDate(d);
}
