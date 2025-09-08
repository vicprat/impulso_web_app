'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { slideUp } from '@/src/helpers/animations'

interface Benefit {
  id: string
  text: string
}

interface MembershipCardProps {
  benefits: Benefit[]
  currency: string
  price: string
  period: string
  title: string
  subtitle: string
  description: string
  buttonText: string
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  benefits,
  buttonText,
  currency,
  description,
  period,
  price,
  subtitle,
  title,
}) => {
  const handleMembershipClick = () => {
    const subject = encodeURIComponent('Solicitud de Membresía - Impulso Galería')
    const body = encodeURIComponent(
      `Hola,\n\nMe interesa adquirir la membresía de Impulso Galería.\n\nPor favor, envíenme más información sobre el proceso de registro y los beneficios incluidos.\n\nSaludos cordiales.`
    )
    window.open(`mailto:info@impulsogaleria.com?subject=${subject}&body=${body}`, '_blank')
  }

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
          <h2 className='mb-6 text-4xl font-bold md:text-5xl'>
            Nos ocuparemos de todas tus necesidades
          </h2>
          <p className='mx-auto max-w-3xl text-lg'>
            Somos especialistas en vender obras de arte de artistas nacionales, nuevos, establecidos
            y emergentes. Nuestro equipo calificado puede ayudarlo a determinar y lograr el mejor
            precio por su trabajo, a través de una promoción efectiva en línea.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
          {/* Left Content */}
          <motion.div
            variants={slideUp}
            initial='initial'
            animate='animate'
            className='text-center lg:text-left'
          >
            <h1 className='mb-6 text-5xl font-bold md:text-6xl lg:text-7xl'>{title}</h1>
            <p className='mx-auto mb-8 max-w-lg text-lg lg:mx-0'>{description}</p>
            <Button
              size='lg'
              variant='outline'
              className='border-amber-400 text-amber-400 transition-colors duration-200 hover:bg-amber-400 hover:text-gray-900'
            >
              {buttonText}
            </Button>
          </motion.div>

          {/* Right Content - Membership Card */}
          <motion.div
            variants={slideUp}
            initial='initial'
            animate='animate'
            transition={{ delay: 0.2 }}
            className='rounded-2xl bg-white p-8 shadow-2xl'
          >
            <div className='mb-6 text-center'>
              <h2 className='mb-2 text-2xl font-bold text-gray-900'>{subtitle}</h2>
              <div className='mb-4'>
                <span className='text-sm text-gray-600'>POR SOLO</span>
                <div className='text-4xl font-bold text-gray-900'>
                  {currency}
                  {price}
                </div>
                <span className='text-sm text-gray-600'>{period}</span>
              </div>
              <div className='mx-auto mb-6 h-px w-24 bg-amber-400'></div>
            </div>

            <div className='mb-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>Beneficios para ti</h3>
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
              size='lg'
              className='w-full bg-gray-900 text-white transition-colors duration-200 hover:bg-gray-800'
              onClick={handleMembershipClick}
            >
              Adquirir
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
