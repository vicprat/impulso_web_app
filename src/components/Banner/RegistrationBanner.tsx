'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Palette, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { ROUTES } from '@/src/config/routes'
import { useAuth } from '@/src/modules/auth/context/useAuth'

export function RegistrationBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const { user } = useAuth()

  // Solo mostrar el banner si no hay usuario autenticado y el banner está visible
  if (!isVisible || user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className='relative overflow-hidden border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white backdrop-blur-xl'
    >
      {/* Elementos decorativos sutiles */}
      <div className='absolute inset-0'>
        <div
          className='absolute left-8 top-4 size-1 animate-pulse rounded-full bg-white/30'
          style={{ animationDuration: '3s' }}
        />
        <div
          className='absolute right-12 top-8 size-1.5 animate-pulse rounded-full bg-white/20'
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <div
          className='absolute bottom-6 left-1/3 size-1 animate-pulse rounded-full bg-white/25'
          style={{ animationDelay: '2s', animationDuration: '5s' }}
        />
        <div
          className='absolute bottom-3 right-1/4 size-1 animate-pulse rounded-full bg-white/15'
          style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}
        />
      </div>

      {/* Gradiente sutil de overlay */}
      <div className='absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-violet-600/10' />

      <div className='container relative z-10 mx-auto px-6 py-1.5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
              className='flex items-center gap-2 opacity-80'
            >
              <Palette className='size-5 text-indigo-300' />
              <Sparkles className='size-4 text-violet-300' />
            </motion.div>

            <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3'>
              <span className='text-sm font-medium tracking-wide text-white/90'>
                Descubre el arte que te inspira
              </span>
              <span className='text-xs font-light text-white/60'>
                Únete a nuestra comunidad creativa
              </span>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              href={ROUTES.AUTH.LOGIN.PATH}
              className='group flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/30 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10'
            >
              <span className='text-white/90 group-hover:text-white'>Registrarse</span>
              <motion.div initial={{ x: 0 }} whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                <ArrowRight className='size-4 text-white/70 group-hover:text-white/90' />
              </motion.div>
            </Link>

            <button
              onClick={() => setIsVisible(false)}
              className='group rounded-lg p-1.5 transition-all duration-200 hover:scale-105 hover:bg-white/10'
              aria-label='Cerrar banner'
            >
              <X className='size-4 text-white/60 group-hover:text-white/90' />
            </button>
          </div>
        </div>
      </div>

      {/* Efecto de brillo sutil */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent'
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: 6,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
    </motion.div>
  )
}
