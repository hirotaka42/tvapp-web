import { UserRole } from '@/types/User';

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig = {
  [UserRole.GENERAL]: {
    label: '一般ユーザー',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    darkColor: 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
  },
  [UserRole.DL_ENABLED]: {
    label: 'DL有効化',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
  },
  [UserRole.TV_ENABLED]: {
    label: 'TV有効化',
    color: 'bg-green-100 text-green-800 border-green-300',
    darkColor: 'dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  },
  [UserRole.PREVIEW]: {
    label: 'プレビュー',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    darkColor: 'dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
  },
  [UserRole.SUPER_USER]: {
    label: '特権ユーザー',
    color: 'bg-red-100 text-red-800 border-red-300',
    darkColor: 'dark:bg-red-900 dark:text-red-200 dark:border-red-700',
  },
};

export function UserRoleBadge({ role, className = '' }: UserRoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color} ${config.darkColor} ${className}`}
    >
      {config.label} (Role: {role})
    </span>
  );
}
