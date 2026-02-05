import type { Metadata } from 'next'

import { RegistrationDialog } from '@/components/Dialog/RegistrationDialog'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { baseMetadata } from '@/lib/metadata'

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

      <RegistrationDialog />
    </div>
  )
}
