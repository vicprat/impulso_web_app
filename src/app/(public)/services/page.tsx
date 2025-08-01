'use client'

import { motion } from 'framer-motion'
import { BookOpen, DollarSign, Frame, Image, Printer, TrendingUp } from 'lucide-react'
import Script from 'next/script'

import { Breadcrumbs } from '@/components/Breadcrumbs'


interface Service {
  id: string
  title: string
  description: string
  imageUrl: string
  icon: React.ComponentType<{ className?: string }>
}

const services: Service[] = [
  {
    description: 'Desarrollamos artistas a través de la venta de obra original y gráfica (fotografía, serigrafía, grabado) de talentos mexicanos consagrados, emergentes y nuevos.',
    icon: DollarSign,
    id: '1',
    imageUrl: '/images/services/original-art.jpg',
    title: 'Venta de obra original'
  },
  {
    description: 'Mantenemos altos estándares de calidad para la conservación de obras de arte, recuerdos, fotografías y objetos valiosos.',
    icon: Frame,
    id: '2',
    imageUrl: '/images/services/framing.jpg',
    title: 'Enmarcado'
  },
  {
    description: 'Equipos de alta calidad para reproducciones de arte y variedad de papeles para satisfacer todas las necesidades.',
    icon: Printer,
    id: '3',
    imageUrl: '/images/services/printing.jpg',
    title: 'Estudio de Impresión'
  },
  {
    description: 'El arte como inversión mantiene su valor y se comporta de manera diferente a otros activos financieros.',
    icon: TrendingUp,
    id: '4',
    imageUrl: '/images/services/investment.jpg',
    title: 'Inversión en Arte'
  },
  {
    description: 'Facilita el colgado de cuadros con una gama completa de sistemas de colgaje.',
    icon: Image,
    id: '5',
    imageUrl: '/images/services/hanging.jpg',
    title: 'Sistema de Colgajes'
  },
  {
    description: 'Impresión de revistas, folletos, catálogos y libros de arte en grandes cantidades.',
    icon: BookOpen,
    id: '6',
    imageUrl: '/images/services/catalogs.jpg',
    title: 'Fabricación de Catálogos y Libros de Arte'
  }
]

const fadeIn = {
  animate: { opacity: 1 },
  initial: { opacity: 0 },
  transition: { duration: 0.5 },
}

const slideUp = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 50 },
  transition: { duration: 0.7, ease: 'easeInOut' },
}

export default function ServicesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "areaServed": "México",
    "description": "Servicios especializados en arte contemporáneo: venta de obra original, enmarcado, impresión digital, inversión en arte, sistemas de colgaje y fabricación de catálogos.",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "itemListElement": services.map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "description": service.description,
          "name": service.title
        }
      })),
      "name": "Servicios de Arte"
    },
    "name": "Servicios de Arte - Impulso Galería",
    "provider": {
      "@type": "Organization",
      "name": "Impulso Galería",
      "url": "https://impulsogaleria.com"
    },
    "serviceType": "Servicios de Arte"
  }

  return (
    <>
      <Script
        id="services-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className='min-h-screen'>
        <div className='container mx-auto px-6 py-12'>
          {/* Breadcrumbs */}
          <Breadcrumbs items={[ { label: 'Servicios' } ]} />

          {/* Header */}
          <header>
            <motion.div
              variants={slideUp}
              initial='initial'
              animate='animate'
              className='mb-16 text-center'
            >
              <h1 className='mb-4 text-4xl font-bold  md:text-5xl lg:text-6xl'>
                Servicios
              </h1>
              <p className='mx-auto max-w-2xl text-lg '>
                Ofrecemos una gama completa de servicios especializados para el mundo del arte
              </p>
            </motion.div>
          </header>

          {/* Services Grid */}
          <section aria-label="Servicios disponibles">
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <motion.article
                    key={service.id}
                    variants={slideUp}
                    initial='initial'
                    animate='animate'
                    transition={{ delay: index * 0.1 }}
                    className='group overflow-hidden rounded-lg bg-gray-50 shadow-md transition-all duration-300 hover:shadow-lg'
                  >
                    <div className='relative aspect-video overflow-hidden'>
                      <div className='absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/40' />
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <IconComponent className='size-16 text-gray-600' />
                      </div>
                      <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                    </div>

                    <div className='p-6'>
                      <h3 className='mb-3 text-xl font-semibold text-gray-900'>
                        {service.title}
                      </h3>
                      <p className='text-gray-600'>
                        {service.description}
                      </p>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </section>


        </div>
      </div >
    </>
  )
} 