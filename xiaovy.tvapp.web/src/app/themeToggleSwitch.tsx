"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export const ThemeToggleSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDarkMode = resolvedTheme === "dark";
  const handleToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11
        ${isDarkMode ? "bg-black" : "bg-gray-300"}
      `}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
          ${isDarkMode ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
};