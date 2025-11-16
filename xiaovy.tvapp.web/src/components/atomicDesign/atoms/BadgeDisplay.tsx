// src/components/atomicDesign/atoms/BadgeDisplay.tsx
import { UserRole } from '@/types/User';

interface BadgeDisplayProps {
  role?: UserRole;
  verified?: boolean;
  type?: 'email' | 'phone';
}

export function BadgeDisplay({ role, verified, type }: BadgeDisplayProps) {
  // ロールバッジ
  if (role !== undefined) {
    const roleConfig = {
      [UserRole.GUEST]: {
        label: 'ゲスト(制限)',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      },
      [UserRole.GENERAL]: {
        label: '一般',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      },
      [UserRole.DL_ENABLED]: {
        label: 'DL有効',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      },
      [UserRole.TV_ENABLED]: {
        label: 'TV有効',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      },
      [UserRole.PREVIEW]: {
        label: 'プレビュー',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      },
      [UserRole.SUPER_USER]: {
        label: 'スーパーユーザー',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      },
    };

    const config = roleConfig[role] || roleConfig[UserRole.GENERAL];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  }

  // 認証状態バッジ
  if (verified !== undefined) {
    const label = type === 'email' ? 'メール' : type === 'phone' ? '電話' : '';
    const statusLabel = verified ? '認証済み' : '未認証';
    const color = verified
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {label}{statusLabel}
      </span>
    );
  }

  return null;
}
