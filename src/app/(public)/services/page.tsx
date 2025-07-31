'use client'

import { motion } from 'framer-motion'
import { BookOpen, DollarSign, Frame, Image, Printer, TrendingUp } from 'lucide-react'


interface Service {
  id: string
  title: string
  description: string
  imageUrl: string
  icon: React.ComponentType<{ className?: string }>
}

const services: Service[] = [
  {
    id: '1',
    title: 'Venta de obra original',
    description: 'Desarrollamos artistas a través de la venta de obra original y gráfica (fotografía, serigrafía, grabado) de talentos mexicanos consagrados, emergentes y nuevos.',
    imageUrl: '/images/services/original-art.jpg',
    icon: DollarSign
  },
  {
    id: '2',
    title: 'Enmarcado',
    description: 'Mantenemos altos estándares de calidad para la conservación de obras de arte, recuerdos, fotografías y objetos valiosos.',
    imageUrl: '/images/services/framing.jpg',
    icon: Frame
  },
  {
    id: '3',
    title: 'Estudio de Impresión',
    description: 'Equipos de alta calidad para reproducciones de arte y variedad de papeles para satisfacer todas las necesidades.',
    imageUrl: '/images/services/printing.jpg',
    icon: Printer
  },
  {
    id: '4',
    title: 'Inversión en Arte',
    description: 'El arte como inversión mantiene su valor y se comporta de manera diferente a otros activos financieros.',
    imageUrl: '/images/services/investment.jpg',
    icon: TrendingUp
  },
  {
    id: '5',
    title: 'Sistema de Colgajes',
    description: 'Facilita el colgado de cuadros con una gama completa de sistemas de colgaje.',
    imageUrl: '/images/services/hanging.jpg',
    icon: Image
  },
  {
    id: '6',
    title: 'Fabricación de Catálogos y Libros de Arte',
    description: 'Impresión de revistas, folletos, catálogos y libros de arte en grandes cantidades.',
    imageUrl: '/images/services/catalogs.jpg',
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

export default function ServicesPage() {
  return (
    <div className='min-h-screen'>
      <div className='container mx-auto px-6 py-12'>
        {/* Header */}
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

        {/* Services Grid */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <motion.div
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
                    <IconComponent className='h-16 w-16 text-gray-600' />
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
              </motion.div>
            )
          })}
        </div>


      </div>
    </div >
  )
} 