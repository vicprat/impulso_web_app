'use client'

import { useAuth } from '@/src/modules/auth/context/useAuth'
import { motion } from 'framer-motion'
import { ArrowRight, Palette, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function RegistrationBanner() {
  const [ isVisible, setIsVisible ] = useState(true)
  const { user } = useAuth()

  // Solo mostrar el banner si no hay usuario autenticado y el banner está visible
  if (!isVisible || user) return null

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.8, ease: [ 0.25, 0.1, 0.25, 1 ] }}
      className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/50 backdrop-blur-xl"
    >
      {/* Elementos decorativos sutiles */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-8 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-6 left-1/3 w-1 h-1 bg-white/25 rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        <div className="absolute bottom-3 right-1/4 w-1 h-1 bg-white/15 rounded-full animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }} />
      </div>

      {/* Gradiente sutil de overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-violet-600/10" />

      <div className="relative z-10 container mx-auto px-6 py-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [ 0, 360 ] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-2 opacity-80"
            >
              <Palette className="w-5 h-5 text-indigo-300" />
              <Sparkles className="w-4 h-4 text-violet-300" />
            </motion.div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-sm font-medium text-white/90 tracking-wide">
                Descubre el arte que te inspira
              </span>
              <span className="text-xs text-white/60 font-light">
                Únete a nuestra comunidad creativa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/register"
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10"
            >
              <span className="text-white/90 group-hover:text-white">Registrarse</span>
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white/90" />
              </motion.div>
            </Link>

            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 group"
              aria-label="Cerrar banner"
            >
              <X className="w-4 h-4 text-white/60 group-hover:text-white/90" />
            </button>
          </div>
        </div>
      </div>

      {/* Efecto de brillo sutil */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: [ '-200%', '200%' ]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 3
        }}
      />
    </motion.div>
  )
}