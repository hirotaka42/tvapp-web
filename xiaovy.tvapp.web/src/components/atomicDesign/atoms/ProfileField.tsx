// src/components/atomicDesign/atoms/ProfileField.tsx
import { ReactNode } from 'react';

interface ProfileFieldProps {
  label: string;
  value: string | ReactNode;
  badge?: ReactNode;
}

export function ProfileField({ label, value, badge }: ProfileFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </dt>
      <dd className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
        {value}
        {badge}
      </dd>
    </div>
  );
}
