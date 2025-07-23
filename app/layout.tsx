// app/layout.tsx
'use client';

import './globals.css';
import { useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';
import { DM_Serif_Display } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
    <html lang="en" className={`${poppins.variable} ${dmSerif.variable}`}>
      <body className="font-sans bg-white text-gray-900 dark:bg-gray-900 dark:text-white flex flex-col min-h-screen">
        {children}

        {/* Switch */}
        <div className="fixed bottom-4 right-4 flex flex-col items-center z-50">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
              className="sr-only"
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner dark:bg-gray-600 transition">
              <div
                className={`w-6 h-6 bg-white rounded-full shadow transform transition ${
                  isDarkMode ? 'translate-x-6' : ''
                }`}
              />
            </div>
          </label>
          <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            of course you can switch to dark mode
          </span>
        </div>
      </body>
    </html>
  );
}

