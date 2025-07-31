'use client'

import { motion } from 'framer-motion'
import { BookOpen, DollarSign, Frame, Image, Printer, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/src/config/routes'

interface Service {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const services: Service[] = [
  {
    id: '1',
    title: 'Venta de obra original',
    description: 'Desarrollamos artistas a través de la venta de obra original y gráfica.',
    icon: DollarSign
  },
  {
    id: '2',
    title: 'Enmarcado',
    description: 'Mantenemos altos estándares de calidad para la conservación de obras de arte.',
    icon: Frame
  },
  {
    id: '3',
    title: 'Estudio de Impresión',
    description: 'Equipos de alta calidad para reproducciones de arte y variedad de papeles.',
    icon: Printer
  },
  {
    id: '4',
    title: 'Inversión en Arte',
    description: 'El arte como inversión mantiene su valor y se comporta diferente a otros activos.',
    icon: TrendingUp
  },
  {
    id: '5',
    title: 'Sistema de Colgajes',
    description: 'Facilita el colgado de cuadros con una gama completa de sistemas.',
    icon: Image
  },
  {
    id: '6',
    title: 'Fabricación de Catálogos',
    description: 'Impresión de revistas, folletos, catálogos y libros de arte.',
    icon: BookOpen
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

export const ServicesSection: React.FC = () => {
  return (
    <section className='py-20'>
      <div className='container mx-auto px-6'>
        <motion.div
          variants={slideUp}
          initial='initial'
          whileInView='animate'
          viewport={{ once: true }}
          className='mb-16 text-center'
        >
          <h2 className='mb-4 text-4xl font-bold md:text-5xl lg:text-6xl'>
            Servicios
          </h2>
          <p className='mx-auto max-w-2xl text-lg'>
            Ofrecemos una gama completa de servicios especializados para el mundo del arte
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className='grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6'>
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <motion.div
                key={service.id}
                variants={slideUp}
                initial='initial'
                whileInView='animate'
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='group text-center'
              >
                {/* Icon Circle */}
                <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400 bg-transparent transition-all duration-300 group-hover:bg-amber-400/20'>
                  <IconComponent className='h-8 w-8 text-amber-400' />
                </div>

                {/* Text */}
                <div className='space-y-2'>
                  <h3 className='text-sm font-medium text-white'>
                    {service.title}
                  </h3>
                  <p className='text-xs leading-tight'>
                    {service.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          variants={fadeIn}
          initial='initial'
          whileInView='animate'
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className='mt-12 text-center'
        >
          <Button
            asChild
            size='lg'
            variant='outline'
            className='border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors duration-200'
          >
            <Link href={ROUTES.STORE.SERVICES.PATH}>
              Más información
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
} 