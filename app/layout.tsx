import './globals.css'
import { Poppins } from 'next/font/google'
import { DM_Serif_Display } from 'next/font/google'

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
    <html lang="en" className={`${poppins.variable} ${dmSerif.variable}`}>
      <body className="font-sans bg-white text-gray-900 flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  )
}