'use client';

import { FormEvent, useState } from 'react';

interface SearchBarProps {
  placeholder: string;
  defaultValue?: string;
  onSubmit?: (query: string) => void;
}

export function SearchBar({ placeholder, defaultValue = '', onSubmit }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(value.trim());
  };

  return (
    <form className="hd-sr" role="search" onSubmit={handleSubmit}>
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="m10.6 10.6 3.2 3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label="検索"
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  );
}
