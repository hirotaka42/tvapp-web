import React, { ChangeEvent } from 'react';

interface InputFieldProps {
  name: string;
  value: string;
  type?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  label?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  value,
  type = "text",
  onChange,
  placeholder,
  error,
  label,
  required = false,
}) => (
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
    <input
      id={name}
      name={name}
      value={value}
      type={type}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`
        block w-full h-12 px-4 rounded-lg border
        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 dark:border-slate-700'}
        focus:outline-none focus:ring-2 focus:ring-offset-0
        dark:bg-slate-800 dark:text-white
        transition-all duration-200
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        text-gray-900 dark:text-white
      `.trim().replace(/\s+/g, ' ')}
    />
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

export default InputField;