import Image from 'next/image';

interface ProfileAvatarProps {
  photoURL: string | null;
  userName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-32 h-32 text-2xl',
  xl: 'w-48 h-48 text-4xl',
};

const sizePixels = {
  xs: 32,
  sm: 40,
  md: 48,
  lg: 128,
  xl: 192,
};

export function ProfileAvatar({ photoURL, userName, size = 'md', className = '' }: ProfileAvatarProps) {
  const sizeClass = sizeClasses[size];
  const pixels = sizePixels[size];

  if (photoURL) {
    return (
      <Image
        src={photoURL}
        alt={userName}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        width={pixels}
        height={pixels}
      />
    );
  }

  // デフォルトアバター（イニシャル表示）
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizeClass} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-semibold ${className}`}>
      <span className="text-gray-600 dark:text-gray-200">
        {initials}
      </span>
    </div>
  );
}
