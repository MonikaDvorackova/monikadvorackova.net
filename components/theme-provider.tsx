'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const final = stored === 'dark' || (!stored && prefersDark);
    setIsDark(final);
    document.documentElement.classList.toggle('dark', final);
    localStorage.setItem('theme', final ? 'dark' : 'light');
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {children}
      <ThemeToggle />
    </>
  );
}
