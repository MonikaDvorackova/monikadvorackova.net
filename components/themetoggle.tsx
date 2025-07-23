'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode ? 'true' : 'false');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggle}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 transition-all duration-300">
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
              isDarkMode ? 'translate-x-full' : ''
            }`}
          />
        </div>
      </label>
      <span className="mt-2 text-xs text-neutral-800 dark:text-neutral-200 text-right">
        of course you can switch to dark mode
      </span>
    </div>
  );
}
