import Image from 'next/image';

interface ProfileAvatarProps {
  photoURL: string | null;
  userName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-20 h-20 text-base',
  lg: 'w-32 h-32 text-2xl',
  xl: 'w-48 h-48 text-4xl',
};

const sizePixels = {
  sm: 40,
  md: 80,
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
