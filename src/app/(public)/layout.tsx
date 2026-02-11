import type { Metadata } from 'next'

import { RegistrationBanner } from '@/components/Banner/RegistrationBanner'
import { RegistrationDialog } from '@/components/Dialog/RegistrationDialog'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { getBannerContent, getContactContent } from '@/lib/landing-data'
import { baseMetadata } from '@/lib/metadata'

export const metadata: Metadata = baseMetadata

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [bannerContent, whatsappContent] = await Promise.all([
    getBannerContent('registration dialog'),
    getContactContent('whatsapp'),
  ])

  const tb = (key: string, fallback: string) => bannerContent[key]?.es ?? fallback
  const tw = (key: string, fallback: string) => whatsappContent[key]?.es ?? fallback

  return (
    <div className='min-h-screen'>
      <RegistrationBanner
        title={tb('banner.title', 'Descubre el arte que te inspira')}
        subtitle={tb('banner.subtitle', 'Únete a nuestra comunidad creativa')}
        buttonText={tb('banner.button', 'Registrarse')}
      />
      <main className='w-full'>
        <Header.Public />

        {children}
      </main>
      <Footer />
      <WhatsAppButton
        greeting={tw('whatsapp.greeting', '¡Hola! 👋 ¿Necesitas ayuda?')}
        subtitle={tw('whatsapp.subtitle', 'Descubre nuestra galeria, eventos y experiencias')}
        buttonLabel={tw('whatsapp.buttonLabel', 'Contactar por WhatsApp')}
        buttonTitle={tw('whatsapp.buttonTitle', '¡Escríbenos por WhatsApp!')}
        whatsappUrl={tw('whatsapp.url', '')}
      />

      <RegistrationDialog />
    </div>
  )
}
