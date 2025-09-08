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
        {/* Preconnect hints para mejorar rendimiento - Solo los más críticos */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link rel='preconnect' href='https://xhsidbbijujrdjjymhbs.supabase.co' />

        {/* Fuentes optimizadas con font-display: swap */}
        <link
          href='https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap'
          rel='stylesheet'
        />

        {/* PWA y metadatos adicionales */}
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#000000' />
        <meta name='msapplication-TileColor' content='#000000' />

        {/* Metadatos adicionales para SEO */}
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='format-detection' content='telephone=no' />

        {/* Preload de recursos críticos */}
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <link rel='dns-prefetch' href='//fonts.gstatic.com' />
      </head>
      <body className='min-h-screen' suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
