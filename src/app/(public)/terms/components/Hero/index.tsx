'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { FileText, Shield } from 'lucide-react'

import { GradientBackground } from '@/src/components/Animations'

export const Hero: React.FC = () => {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className='mb-6'
          >
            <div className='bg-card/80 mb-8 inline-flex items-center gap-3 rounded-full px-6 py-3 shadow-elevation-2 backdrop-blur-sm'>
              <Shield className='size-5 text-primary' />
              <span className='text-sm font-medium text-white'>Política de Privacidad</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className='mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl xl:text-8xl'
            style={{ opacity }}
          >
            Términos y
            <motion.span
              className='block bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent'
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Condiciones
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className='mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-white lg:text-2xl'
          >
            Conoce nuestras políticas de privacidad y términos de uso para una experiencia
            transparente y segura
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className='flex items-center justify-center gap-2 text-sm text-white'
          >
            <FileText className='size-4' />
            <span>Información importante sobre el uso de nuestros servicios</span>
          </motion.div>
        </motion.header>
      </div>
    </GradientBackground>
  )
}
