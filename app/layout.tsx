import './globals.css'
import { Poppins } from 'next/font/google'
import { DM_Serif_Display } from 'next/font/google'
import ThemeToggle from '@/components/ThemeToggle'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-white text-gray-900 dark:bg-black dark:text-white flex flex-col min-h-screen transition-colors duration-300">
        {children}
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </body>
    </html>
  )
}
