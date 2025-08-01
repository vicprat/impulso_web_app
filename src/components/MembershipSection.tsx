'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/src/config/routes'

interface Benefit {
  id: string
  text: string
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

export const MembershipSection: React.FC = () => {
  return (
    <section className='srelative overflow-hidden py-20'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-black/20' />
      <div className='absolute inset-0 ' />

      <div className='container relative z-10 mx-auto px-6'>
        <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
          {/* Left Content */}
          <motion.div
            variants={slideUp}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            className='text-center lg:text-left'
          >
            <h2 className='mb-6 text-4xl font-bold  md:text-5xl lg:text-6xl'>
              Vende tus obras
            </h2>
            <p className='mx-auto mb-8  max-w-lg text-lg lg:mx-0'>
              ADQUIERA UN PLAN DE MEMBRESÍA Y DISFRUTE DE LOS GRANDES BENEFICIOS DE VENDER SU ARTE CON NOSOTROS.
            </p>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='border-amber-400 text-amber-400 transition-colors duration-200 hover:bg-amber-400 hover:text-gray-900'
            >
              <Link href={ROUTES.STORE.MEMBERSHIP.PATH}>
                Más información
              </Link>
            </Button>
          </motion.div>

          {/* Right Content - Membership Card */}
          <motion.div
            variants={slideUp}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='rounded-2xl bg-white p-8 shadow-2xl'
          >
            <div className='mb-6 text-center'>
              <h3 className='mb-2 text-2xl font-bold text-gray-900'>
                Mi espacio Impulso
              </h3>
              <div className='mb-4'>
                <span className='text-sm text-gray-600'>POR SOLO</span>
                <div className='text-4xl font-bold text-gray-900'>
                  $500.00
                </div>
                <span className='text-sm text-gray-600'>MXN/mensual</span>
              </div>
              <div className='mx-auto mb-6 h-px w-24 bg-amber-400'></div>
            </div>

            <div className='mb-6'>
              <h4 className='mb-4 text-lg font-semibold text-gray-900'>
                Beneficios para ti
              </h4>
              <div className='space-y-3'>
                {benefits.map((benefit) => (
                  <div key={benefit.id} className='flex items-start gap-3'>
                    <Check className='mt-0.5 size-5 shrink-0 text-green-500' />
                    <span className='text-sm text-gray-700'>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              asChild
              size='lg'
              className='w-full bg-gray-900 text-white transition-colors duration-200 hover:bg-gray-800'
            >
              <Link href={ROUTES.STORE.MEMBERSHIP.PATH}>
                Adquirir
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 