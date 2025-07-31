/* eslint-disable @next/next/no-img-element */
'use client'

import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import Link from 'next/link'

import {
  AnimatedSpheres,
  FloatingParticles,
  GradientBackground,
  GridOverlay,
} from '@/components/Animations'
import { ROUTES } from '@/src/config/routes'

const navigationLinks = [
  { href: ROUTES.STORE.MAIN.PATH, name: 'Galería' },
  { href: ROUTES.STORE.EVENTS.PATH, name: 'Eventos' },
  { href: ROUTES.STORE.TERMS.PATH, name: 'Términos y condiciones' },
]

const socialLinks = [
  { href: 'https://twitter.com/galeriaimpulso', icon: Twitter, name: 'Twitter', handle: '@galeriaimpulso' },
  { href: 'https://facebook.com/impulsogaleria', icon: Facebook, name: 'Facebook', handle: '/impulsogaleria' },
  { href: 'https://instagram.com/impulsogaleria', icon: Instagram, name: 'Instagram', handle: '@impulsogaleria' },
]

export const Footer = () => {
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
        <div className='container mx-auto px-4 py-12 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {/* Contact Information */}
            <div className='space-y-4'>
              <div className='mb-6'>
                <div className='text-2xl font-bold tracking-wider'>
                  IMPULSO
                </div>
                <div className='text-sm underline'>
                  galeria
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-start'>
                  <MapPin className='mr-3 mt-1 size-4 flex-shrink-0' />
                  <span className='text-sm'>
                    Hacienda Escolásticas 107, Jardines de la Hacienda, 76180 Santiago de Querétaro, Querétaro.
                  </span>
                </div>
                <div className='flex items-center'>
                  <Mail className='mr-3 size-4 flex-shrink-0' />
                  <span className='text-sm'>
                    Correo electrónico: info@impulsogaleria.com
                  </span>
                </div>
                <div className='flex items-center'>
                  <Phone className='mr-3 size-4 flex-shrink-0' />
                  <span className='text-sm'>
                    Tel: +52 442 831 73 33
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Enlaces</h3>
              <ul className='space-y-2'>
                {navigationLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='text-sm text-gray-300 transition-colors hover:text-white'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media Links */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Redes Sociales</h3>
              <div className='space-y-3'>
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <div key={social.name} className='flex items-center'>
                      <IconComponent className='mr-3 size-4 flex-shrink-0' />
                      <Link
                        href={social.href}
                        className='text-sm text-gray-300 transition-colors hover:text-white'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {social.handle}
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className='mt-8 border-t border-gray-800 pt-8 text-center'>
            <p className='text-sm text-gray-400'>
              © {new Date().getFullYear()} Impulso Galería. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
