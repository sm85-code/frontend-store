import { THEME_INIT_SCRIPT } from '@store/ui'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SITE_URL } from '@/lib/api'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Ampelkuning — Belanja Online', template: '%s · Ampelkuning' },
  description: 'Belanja produk pilihan dengan harga terbaik di Ampelkuning.',
  openGraph: { type: 'website', siteName: 'Ampelkuning', locale: 'id_ID' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffdf7' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1a14' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
            Lewati ke konten
          </a>
          <Header />
          <main id="konten" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
