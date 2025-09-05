import { PreloadImages } from '@/components/PreloadImages'
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
        {/* Preconnect hints para mejorar rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://xhsidbbijujrdjjymhbs.supabase.co" />

        {/* Fuentes optimizadas con font-display: swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className='min-h-screen ' suppressHydrationWarning>
        <PreloadImages
          images={[
            'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled.webp',
            'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3381.webp'
          ]}
          priority={false}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
