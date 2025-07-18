// app/layout.tsx
import '../styles/globals.css'
import React, { ReactNode } from 'react'
import Link from 'next/link'

interface Props { children: ReactNode }

export const metadata = {
  title: 'Monika Dvorackova - Artificial Intelligence Engineer & Consultant'
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="cs">
      <body className="flex flex-col min-h-screen text-gray-900 bg-white">
        <header className="py-6 px-8 border-b">
          <h1 className="text-2xl font-bold">Monika Dvořáčková</h1>
          <p className="text-sm text-gray-600">AI engineer & consultant</p>
        </header>
        <main className="flex-grow px-8 py-6">{children}</main>
        <footer className="py-4 px-8 border-t text-sm flex space-x-4">
          <Link href="https://github.com/monikadvorackova">GitHub</Link>
          <Link href="https://www.linkedin.com/in/monikadvorackova">LinkedIn</Link>
          <a href="mailto:monika@monikadvorackova.net">monika@monikadvorackova.net</a>
        </footer>
      </body>
    </html>
  )
}
