// app/components/ThemeToggle.tsx
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
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={() => setIsDarkMode(!isDarkMode)}
          className="sr-only"
        />
        <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner dark:bg-gray-600 transition">
          <div
            className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
              isDarkMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </div>
      </label>
      <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right max-w-[8rem]">
        of course you can switch to dark mode
      </span>
    </div>
  );
}
