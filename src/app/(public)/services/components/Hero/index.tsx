'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

import { GradientBackground } from '@/src/components/Animations'

interface Props {
  content?: Record<string, { en: string; es: string }>
}

export const Hero: React.FC<Props> = ({ content = {} }) => {
  const t = (key: string, fallback: string) => content[key]?.es ?? fallback

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3])

  return (
    <GradientBackground className='relative overflow-hidden py-24 lg:py-32'>
      <motion.div
        className='bg-primary/10 absolute left-10 top-20 size-32 rounded-full blur-3xl'
        style={{ y: y1 }}
      />
      <motion.div
        className='bg-primary/5 absolute bottom-20 right-10 size-48 rounded-full blur-3xl'
        style={{ y: y2 }}
      />

      <div className='container mx-auto px-6'>
        <motion.header
          initial={{ opacity: 0, scale: 0.9, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className='relative z-10 text-center'
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className='mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl xl:text-8xl'
            style={{ opacity }}
          >
            {t('services.hero.title', 'Servicios que')}
            <motion.span
              className='block bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent'
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              {t('services.hero.titleHighlight', 'Transforman Ideas')}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className='mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-white lg:text-2xl'
          >
            {t(
              'services.hero.subtitle',
              'Desde la venta de obra original hasta servicios técnicos de vanguardia, creamos experiencias artísticas que trascienden lo convencional'
            )}
          </motion.p>
        </motion.header>
      </div>
    </GradientBackground>
  )
}
