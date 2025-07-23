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

  const toggleMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleMode}
          className="sr-only"
        />
        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner transition">
          <div
            className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
              isDarkMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </div>
      </label>
      <span className="mt-2 text-xs text-black dark:text-white text-right max-w-[10rem]">
        of course you can switch to dark mode
      </span>
    </div>
  );
}
