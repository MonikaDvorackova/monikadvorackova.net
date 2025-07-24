'use client';

import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const final = stored === 'dark' || (!stored && prefersDark);
    document.documentElement.classList.toggle('dark', final);
    setIsDark(final);
    setMounted(true);
  }, []);

  return <>{mounted ? children : null}</>;
}
