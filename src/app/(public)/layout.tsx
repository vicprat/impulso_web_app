import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { baseMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = baseMetadata

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen'>
      <main className='w-full'>
        <Header.Public />

        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
