'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
              isDarkMode ? 'translate-x-6' : 'translate-x-0'
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
