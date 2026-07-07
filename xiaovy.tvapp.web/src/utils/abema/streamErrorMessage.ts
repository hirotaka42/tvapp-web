import { AbemaStreamReason } from '@/hooks/useAbemaStream';

/** Map a streaminglink failure reason to a user-facing, varied message. */
export function abemaStreamErrorMessage(reason: AbemaStreamReason | null, fallback?: string): string {
  switch (reason) {
    case 'premium':
      return 'この作品は有料（プレミアム）のため、アプリ内では再生できません。';
    case 'geo':
      return '地域制限により再生できませんでした。日本国内からのみ視聴できます。';
    case 'resolver_unavailable':
      return '配信サーバーに接続できませんでした。ローカルのリゾルバが起動しているかご確認ください。';
    case 'not_found':
      return '再生できる映像が見つかりませんでした。放送終了、または未配信の可能性があります。';
    case 'upstream':
      return 'ABEMA側で一時的に再生情報を取得できませんでした。少し時間をおいて再試行してください。';
    default:
      return fallback || '現在この番組を再生できませんでした。少し時間をおいて再試行してください。';
  }
}
