// app/layout.tsx
import './globals.css';
import { Poppins } from 'next/font/google';
import { DM_Serif_Display } from 'next/font/google';
import ThemeToggle from './components/themetoggle';

export const metadata = {
  title: 'Monika Dvorackova',
  description: 'AI engineer and legal tech consultant',
  icons: {
    icon: '/favicon.ico',
  },
};

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
  return (
    <html lang="en" className={`${poppins.variable} ${dmSerif.variable}`}>
      <body className="font-sans bg-neutral-100 text-gray-900 dark:bg-neutral-900 dark:text-neutral-100 flex flex-col min-h-screen relative">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
