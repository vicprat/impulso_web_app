import { CTA } from './components/CTA'
import { Hero } from './components/Hero'

import type { Metadata } from 'next'

import { getServices } from '@/lib/landing-data'
import { routeMetadata } from '@/lib/metadata'
import { Card } from '@/src/components/Card'

export const metadata: Metadata = routeMetadata['/services']

// Data fetched in the Page component

export default async function Page() {
  const notionServices = await getServices(true)

  const services = notionServices.map((s) => ({
    description: s.description.es,
    features: s.features,
    iconName: s.iconName,
    id: s.id,
    imageUrl: s.imageUrl || '',
    popular: s.popular,
    price: s.price?.es,
    size: s.size,
    title: s.title.es,
  }))
  return (
    <>
      <div className='min-h-screen '>
        <Hero />

        <section className='py-16 lg:py-24' aria-label='Servicios disponibles'>
          <div className='container mx-auto px-6'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12'>
              {services.map((service, index) => (
                <Card.Service key={service.id} service={service} index={index} />
              ))}
            </div>
            <CTA />
          </div>
        </section>
      </div>
    </>
  )
}
