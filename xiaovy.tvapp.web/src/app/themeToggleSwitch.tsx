"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export const ThemeToggleSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11
        ${theme === "dark" ? "bg-black" : "bg-gray-300"}
      `}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
          ${theme === "dark" ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
};