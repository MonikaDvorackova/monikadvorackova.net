'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark'; // výchozí = světlo
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm text-black dark:text-white flex flex-col items-end">
      <span className="mb-1">
        Of course you can switch to {isDarkMode ? 'light' : 'dark'} mode
      </span>
      <button
        onClick={toggleTheme}
        className="px-4 py-2 bg-white dark:bg-black text-black dark:text-white rounded-full border border-black dark:border-white shadow-md hover:scale-105 transition-transform"
      >
        Toggle
      </button>
    </div>
  );
}
