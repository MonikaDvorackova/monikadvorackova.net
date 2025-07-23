"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 z-50">
      <label htmlFor="theme-toggle" className="text-xs italic text-gray-600 dark:text-gray-300">
        of course you can switch to dark mode
      </label>
      <button
        id="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 rounded-full bg-black text-white hover:scale-110 transition-transform duration-300"
        aria-label="Toggle dark mode"
      >
        {darkMode ? "🌞" : "🌙"}
      </button>
    </div>
  );
}