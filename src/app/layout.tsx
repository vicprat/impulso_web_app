import { Providers } from '@/components/Providers'
import { baseMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'


import './globals.css'

export const metadata: Metadata = baseMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className='min-h-screen ' suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
