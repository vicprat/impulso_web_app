'use client'

import { motion } from 'framer-motion'
import { Check, Headphones, Settings, Shield, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Benefit {
  id: string
  text: string
}

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const benefits: Benefit[] = [
  { id: '1', text: 'Venta de obras' },
  { id: '2', text: 'Impresión digital para reproducciones giclée' },
  { id: '3', text: 'Exposición internacional' },
  { id: '4', text: 'Publicidad' },
  { id: '5', text: 'Pagos seguros' },
  { id: '6', text: 'Sin exclusividad' },
  { id: '7', text: 'Nos encargamos de generar tus guías de envío' }
]

const features: Feature[] = [
  {
    id: '1',
    title: 'SEGURIDAD',
    description: 'Transacciones seguras y protección de tus obras',
    icon: Shield
  },
  {
    id: '2',
    title: 'RECONOCIMIENTO',
    description: 'Presencia en exposiciones internacionales prestigiosas',
    icon: Star
  },
  {
    id: '3',
    title: 'SOPORTE',
    description: 'Atención personalizada en cada paso del proceso',
    icon: Headphones
  },
  {
    id: '4',
    title: 'CALIDAD',
    description: 'Impresiones giclée de máxima calidad profesional',
    icon: Settings
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

export default function MembershipPage() {
  return (
    <div className='min-h-screen '>
   

      {/* Features Section */}
      <section className='py-20'>
        <div className='container mx-auto px-6'>
          <motion.div
            variants={slideUp}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold  md:text-5xl'>
              ¿POR QUÉ IMPULSO GALERÍA?
            </h2>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={feature.id}
                  variants={slideUp}
                  initial='initial'
                  whileInView='animate'
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className='text-center'
                >
                  <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400 bg-white/10'>
                    <IconComponent className='h-10 w-10 text-amber-400' />
                  </div>
                  <h3 className='mb-2 text-lg font-semibold'>
                    {feature.title}
                  </h3>
                  <p className='text-sm'>
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Middle Section */}
      <section className='py-20'>
        <div className='container mx-auto px-6'>
          <motion.div
            variants={slideUp}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <h2 className='mb-6 text-4xl font-bold  md:text-5xl'>
              Nos ocuparemos de todas tus necesidades
            </h2>
            <p className='mx-auto max-w-3xl text-lg '>
              Somos especialistas en vender obras de arte de artistas nacionales, nuevos, establecidos y emergentes.
              Nuestro equipo calificado puede ayudarlo a determinar y lograr el mejor precio por su trabajo,
              a través de una promoción efectiva en línea.
            </p>
          </motion.div>
        </div>
      </section>
   {/* Hero Section */}
      <section className='relative py-20'>
        <div className='absolute ' />
        <div className='container mx-auto px-6 relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Left Content */}
            <motion.div
              variants={slideUp}
              initial='initial'
              animate='animate'
              className='text-center lg:text-left'
            >
              <h1 className='mb-6 text-5xl font-bold  md:text-6xl lg:text-7xl'>
                Vende tus obras
              </h1>
              <p className='mb-8 text-lg text- max-w-lg mx-auto lg:mx-0'>
                ADQUIERA UN PLAN DE MEMBRESÍA Y DISFRUTE DE LOS GRANDES BENEFICIOS DE VENDER SU ARTE CON NOSOTROS.
              </p>
              <Button
                size='lg'
                variant='outline'
                className='border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors duration-200'
              >
                Más información
              </Button>
            </motion.div>

            {/* Right Content - Membership Card */}
            <motion.div
              variants={slideUp}
              initial='initial'
              animate='animate'
              transition={{ delay: 0.2 }}
              className='rounded-2xl p-8 shadow-2xl bg-white'
            >
              <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  Mi espacio Impulso
                </h2>
                <div className='mb-4'>
                  <span className='text-sm text-gray-600'>POR SOLO</span>
                  <div className='text-4xl font-bold text-gray-900'>
                    $500.00
                  </div>
                  <span className='text-sm text-gray-600'>MXN/mensual</span>
                </div>
                <div className='w-24 h-px bg-amber-400 mx-auto mb-6'></div>
              </div>

              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Beneficios para ti
                </h3>
                <div className='space-y-3'>
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className='flex items-start gap-3'>
                      <Check className='h-5 w-5 text-green-500 mt-0.5 flex-shrink-0' />
                      <span className='text-sm text-gray-700'>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size='lg'
                className='w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200'
                onClick={() => {
                  const subject = encodeURIComponent('Solicitud de Membresía - Impulso Galería')
                  const body = encodeURIComponent(`Hola,\n\nMe interesa adquirir la membresía de Impulso Galería.\n\nPor favor, envíenme más información sobre el proceso de registro y los beneficios incluidos.\n\nSaludos cordiales.`)
                  window.open(`mailto:info@impulsogaleria.com?subject=${subject}&body=${body}`, '_blank')
                }}
              >
                Adquirir
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
} 