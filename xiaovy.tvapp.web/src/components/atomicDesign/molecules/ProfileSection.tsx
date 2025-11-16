// src/components/atomicDesign/molecules/ProfileSection.tsx
import { ReactNode } from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';

interface ProfileSectionProps {
  title: string;
  icon?: keyof typeof HeroIcons;
  children: ReactNode;
}

export function ProfileSection({ title, icon, children }: ProfileSectionProps) {
  const Icon = icon ? HeroIcons[icon] : null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      </div>
      <div className="px-6 py-4 space-y-4">
        {children}
      </div>
    </div>
  );
}
