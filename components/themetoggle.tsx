'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-neutral-800 p-2 rounded-full shadow-md">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={() => setIsDarkMode(!isDarkMode)}
          className="sr-only"
        />
        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative transition-all">
          <div
            className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
              isDarkMode ? 'translate-x-6' : ''
            }`}
          />
        </div>
        <span className="text-xs text-black dark:text-white whitespace-nowrap">
          {isDarkMode ? 'Dark mode' : 'Light mode'}
        </span>
      </label>
    </div>
  );
}
