import { CTA } from './components/CTA'
import { Feature } from './components/Feature'
import { Hero } from './components/Hero'
import { MembershipCard } from './components/MembershipCard'

import type { Locale } from '@/types/notion-content.types'
import type { Metadata } from 'next'

import { getBenefits, getFeatures } from '@/lib/landing-data'
import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/membership']

export default async function Page() {
  const [notionBenefits, notionFeatures] = await Promise.all([
    getBenefits('membership'),
    getFeatures(),
  ])

  const benefits = notionBenefits.map((b) => ({
    id: b.id,
    text: (b.text as Record<Locale, string>).es,
  }))

  const features = notionFeatures.map((f) => ({
    description: f.description.es,
    iconName: f.iconName,
    id: f.id,
    title: f.title.es,
  }))
  return (
    <>
      <div className='min-h-screen'>
        <Hero />

        <section className='py-20'>
          <div className='container mx-auto px-6'>
            <div>
              <h2 className='text-4xl font-bold md:text-5xl'>¿POR QUÉ IMPULSO GALERÍA?</h2>
            </div>

            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
              {features.map((feature, index) => (
                <Feature key={feature.id} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        <MembershipCard
          benefits={benefits}
          currency='$'
          price='500.00'
          period='MXN/mensual'
          title='Vende tus obras'
          subtitle='Mi espacio Impulso'
          description='ADQUIERA UN PLAN DE MEMBRESÍA Y DISFRUTE DE LOS GRANDES BENEFICIOS DE VENDER SU ARTE CON NOSOTROS.'
          buttonText='Más información'
        />

        <section className='py-16 lg:py-24' aria-label='Call to action'>
          <div className='container mx-auto px-6'>
            <CTA />
          </div>
        </section>
      </div>
    </>
  )
}
