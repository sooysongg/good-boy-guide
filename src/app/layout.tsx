import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/nav/Navbar'

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Good Boy Guide',
  description: 'Discover dog-friendly cafés, restaurants, bakeries, and bars in Oslo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans bg-stone-50 text-stone-900 antialiased`}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
