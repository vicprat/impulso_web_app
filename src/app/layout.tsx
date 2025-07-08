import { Providers } from '@/components/Providers'

import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  description: 'Plataforma para gestionar tus enlaces y perfil',
  title: 'Mi Aplicación',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className='min-h-screen ' suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
