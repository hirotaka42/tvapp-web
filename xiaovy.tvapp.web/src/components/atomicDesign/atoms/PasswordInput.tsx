import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  value,
  onChange,
  placeholder = 'パスワードを入力',
  error,
  label,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full h-12 px-4 pr-12 rounded-lg border
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:border-slate-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-0
            dark:bg-slate-800 dark:text-white
            transition-all duration-200
            placeholder:text-gray-400 dark:placeholder:text-gray-500
          `.trim().replace(/\s+/g, ' ')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <svg
            className="h-4 w-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
