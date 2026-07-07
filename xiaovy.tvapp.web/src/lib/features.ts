/**
 * 機能フラグ。
 *
 * 段階2(お気に入り/視聴履歴/プロフィール/管理)は現状バックエンド(User/admin ルート)を
 * deferred-phase2/ へ退避しているため MVP では無効。将来 Firestore クライアント方式で
 * 有効化するときに `NEXT_PUBLIC_ENABLE_USER_DATA=1` を設定する。
 *
 * 無効時は、これらのユーザーデータ取得を「呼び出し側で行わない」ことで、
 * 存在しないルートへの 404 とエラートーストを防ぐ。
 */
export const PHASE2_USER_DATA_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_USER_DATA === '1';
