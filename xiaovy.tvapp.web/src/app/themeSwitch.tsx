"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="border-2 border-black dark:border-white"
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
};
