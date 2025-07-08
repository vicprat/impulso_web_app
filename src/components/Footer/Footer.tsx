/* eslint-disable @next/next/no-img-element */
'use client'

import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import {
  AnimatedSpheres,
  FloatingParticles,
  GradientBackground,
  GridOverlay,
} from '@/components/Animations'

import { Button } from '../ui/button'

const navigationLinks = [
  { href: '/', name: 'Inicio' },
  { href: '/tienda', name: 'Tienda' },
  { href: '/colecciones', name: 'Colecciones' },
  { href: '/artistas', name: 'Artistas' },
  { href: '/nosotros', name: 'Nosotros' },
  { href: '/contacto', name: 'Contacto' },
]

const socialLinks = [
  { href: '#', icon: Instagram, name: 'Instagram' },
  { href: '#', icon: Facebook, name: 'Facebook' },
  { href: '#', icon: Twitter, name: 'Twitter' },
  { href: '#', icon: Youtube, name: 'YouTube' },
]

const legalLinks = [
  { href: '/terminos', name: 'Términos y Condiciones' },
  { href: '/privacidad', name: 'Política de Privacidad' },
  { href: '/devoluciones', name: 'Política de Devoluciones' },
  { href: '/envios', name: 'Envíos y Entregas' },
]

export const Footer = () => {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = () => {
    if (email) {
      setEmail('')
      // Aquí iría la lógica real de suscripción
    }
  }

  return (
    <footer className='relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white'>
      {/* Animated background using GradientBackground */}
      <GradientBackground className='absolute inset-0' />

      {/* Animated spheres */}
      <AnimatedSpheres />

      {/* Floating particles */}
      <FloatingParticles
        config={{
          color: 'bg-white/30',
          count: 50,
          maxDuration: 5,
          minDuration: 2,
        }}
      />

      {/* Grid pattern overlay */}
      <GridOverlay />

      <div className='relative z-10'>
        {/* Main footer content */}
        <div className='container mx-auto px-4 pb-8 pt-16 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8'>
            {/* Company Info */}
            <div className='lg:col-span-1'>
              <div className='mb-6'>
                <img
                  src='/assets/logo2.svg'
                  alt='Logo'
                  className='h-full w-auto max-w-32 object-contain sm:max-w-40 lg:max-w-64 '
                />
              </div>

              <div className='space-y-3'>
                <div className='group flex items-center text-gray-300 transition-colors hover:text-white'>
                  <MapPin className='mr-3 size-4 text-white transition-colors' />
                  <span className='text-sm'>Querétaro, México</span>
                </div>
                <div className='group flex items-center text-gray-300 transition-colors hover:text-white'>
                  <Phone className='mr-3 size-4 text-white transition-colors' />
                  <span className='text-sm'>+52 55 1234 5678</span>
                </div>
                <div className='group flex items-center text-gray-300 transition-colors hover:text-white'>
                  <Mail className='mr-3 size-4 text-white transition-colors' />
                  <span className='text-sm'>hola@impulsogaleria.com</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className='lg:col-span-1'>
              <h3 className='mb-6 text-lg font-bold text-white'>Navegación</h3>
              <ul className='space-y-3'>
                {navigationLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='group flex items-center text-gray-300 transition-all duration-300 hover:text-white'
                    >
                      <span className='transition-transform duration-300 group-hover:translate-x-1'>
                        {link.name}
                      </span>
                      <ArrowRight className='ml-2 size-3 opacity-0 transition-all duration-300 group-hover:opacity-100' />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className='lg:col-span-1'>
              <h3 className='mb-6 text-lg font-bold text-white'>Legal</h3>
              <ul className='space-y-3'>
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='group flex items-center text-gray-300 transition-all duration-300 hover:text-white'
                    >
                      <span className='text-sm transition-transform duration-300 group-hover:translate-x-1'>
                        {link.name}
                      </span>
                      <ArrowRight className='ml-2 size-3 opacity-0 transition-all duration-300 group-hover:opacity-100' />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className='lg:col-span-1'>
              <h3 className='mb-6 text-lg font-bold text-white'>Newsletter</h3>
              <p className='mb-4 text-sm text-gray-300'>
                Mantente al día con nuestras últimas colecciones y eventos exclusivos.
              </p>

              <div className='mb-6'>
                <div className='flex flex-col items-center gap-3 sm:flex-row'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='tu@email.com'
                    className='flex-1 rounded-lg border border-white/20 bg-black/30 px-4 py-3 text-white backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400'
                    onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
                  />
                  <Button
                    variant='secondary'
                    onClick={handleNewsletterSubmit}
                    className='px-6 py-3 '
                  >
                    Suscribirse
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className='mb-4 text-sm font-semibold text-white'>Síguenos</h4>
                <div className='flex space-x-4'>
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon
                    return (
                      <Link
                        key={social.name}
                        href={social.href}
                        className='group flex size-10 items-center justify-center rounded-lg border border-white/20 bg-black/30 text-gray-300 backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-400/20 hover:to-pink-500/20 hover:text-white'
                        aria-label={social.name}
                      >
                        <IconComponent className='size-4 transition-transform duration-300 group-hover:scale-110' />
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
