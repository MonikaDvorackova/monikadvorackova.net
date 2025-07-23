'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const enabled = stored === 'true' || (!stored && prefersDark === false); // chceme defaultně světlo
    setIsDarkMode(enabled);

    if (enabled) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
          className="sr-only"
        />
        <div className="w-12 h-6 bg-neutral-400 dark:bg-neutral-600 rounded-full shadow-inner transition-colors">
          <div
            className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
              isDarkMode ? 'translate-x-6' : ''
            }`}
          />
        </div>
      </label>
      <span className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 text-right max-w-[10rem]">
        of course you can switch to dark mode
      </span>
    </div>
  );
}
