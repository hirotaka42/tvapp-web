import { UserRole } from '@/types/User';

/**
 * ロール番号をユーザーフレンドリーな表示名に変換
 */
export function getRoleDisplayName(role: UserRole | number): string {
  switch (role) {
    case UserRole.GUEST:
      return 'ゲストユーザー(機能制限)';
    case UserRole.GENERAL:
      return '一般ユーザー';
    case UserRole.DL_ENABLED:
      return 'DL有効化ユーザー';
    case UserRole.TV_ENABLED:
      return 'TV有効化ユーザー';
    case UserRole.PREVIEW:
      return 'プレビューユーザー';
    case UserRole.SUPER_USER:
      return '特権ユーザー';
    default:
      return '不明なロール';
  }
}

/**
 * ロール番号を日本語の説明文に変換
 */
export function getRoleDescription(role: UserRole | number): string {
  switch (role) {
    case UserRole.GUEST:
      return 'ゲストユーザーです。一部の機能が制限されています。';
    case UserRole.GENERAL:
      return '一般ユーザーです。';
    case UserRole.DL_ENABLED:
      return 'ダウンロード機能が有効化されています。';
    case UserRole.TV_ENABLED:
      return 'TV機能が有効化されています。';
    case UserRole.PREVIEW:
      return 'プレビューユーザーです。';
    case UserRole.SUPER_USER:
      return '特権ユーザーです。';
    default:
      return '';
  }
}
