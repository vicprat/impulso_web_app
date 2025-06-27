import type { Metadata } from 'next'

import './globals.css'
import { Providers } from '@/components/Providers'

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
      <body className='min-h-screen bg-background' suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
