"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {/* Switch */}
      <button
        onClick={toggleTheme}
        className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${
          darkMode ? "bg-gray-700" : "bg-gray-300"
        }`}
        aria-label="Toggle dark mode"
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
            darkMode ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>

      {/* Popisek */}
      <span className="text-xs text-gray-600 dark:text-gray-300 italic mt-1 pr-1 text-right">
        of course you can switch to dark mode
      </span>
    </div>
  );
}
