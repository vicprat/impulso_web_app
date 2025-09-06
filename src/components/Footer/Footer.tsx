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
import { CONTACT } from '@/src/config/constants'
import { ROUTES } from '@/src/config/routes'

const navigationLinks = [
  { href: ROUTES.STORE.MAIN.PATH, name: 'Galería' },
  { href: ROUTES.STORE.EVENTS.PATH, name: 'Eventos' },
  { href: ROUTES.STORE.TERMS.PATH, name: 'Términos y condiciones' },
]

const socialLinks = [
  { handle: '@galeriaimpulso', href: 'https://twitter.com/galeriaimpulso', icon: Twitter, name: 'Twitter' },
  { handle: '/impulsogaleria', href: 'https://facebook.com/impulsogaleria', icon: Facebook, name: 'Facebook' },
  { handle: '@impulsogaleria', href: 'https://instagram.com/impulsogaleria', icon: Instagram, name: 'Instagram' },
]

export const Footer = () => {
  return (
    <footer className='relative overflow-hidden bg-zinc-900'>
      <GradientBackground className='absolute inset-0' />

      {/* Animated spheres */}
      <AnimatedSpheres />

      {/* Floating particles */}
      <FloatingParticles
        config={{
          color: 'bg-primary/20',
          count: 30,
          maxDuration: 6,
          minDuration: 3,
        }}
      />

      <GridOverlay />

      <div className='relative z-10'>
        <div className='container mx-auto px-4 py-12 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>

            <div className='space-y-4'>
              <div className='flex flex-col items-center gap-4 space-y-6'>
                <div className='flex h-16 w-full items-center justify-center'>
                  <img
                    src='/assets/logo.png'
                    alt='Impulso Galería'
                    className='max-h-12 max-w-full object-contain'
                    width={200}
                    height={48}
                  />
                </div>
                <div className='flex h-12 w-full items-center justify-center'>
                  <img
                    src='/assets/berraco.png'
                    alt='Berraco'
                    className='max-h-12 max-w-full object-contain'
                    width={200}
                    height={48}
                  />
                </div>
                <div className='flex h-12 w-full items-center justify-center'>
                  <img
                    src='/assets/collective.png'
                    alt='Collective'
                    className='max-h-12 max-w-full object-contain'
                    width={200}
                    height={48}
                  />
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-white'>Contacto</h3>
              <div className='space-y-4'>
                <div className='group flex items-start'>
                  <Link
                    href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT.ADDRESS)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mr-3 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-on-primary'
                    aria-label={`Ver ubicación en Google Maps: ${CONTACT.ADDRESS}`}
                  >
                    <MapPin className='size-4 text-gray-400 group-hover:text-on-primary' />
                  </Link>
                  <div>
                    <p className='mb-1 text-sm font-medium text-white'>Dirección</p>
                    <p className='text-sm leading-relaxed text-gray-300'>
                      {CONTACT.ADDRESS}
                    </p>
                  </div>
                </div>

                <div className='group flex items-start'>
                  <Link
                    href={`mailto:${CONTACT.EMAIL_INFO}`}
                    className='mr-3 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-on-primary'
                    aria-label={`Enviar email a: ${CONTACT.EMAIL_INFO}`}
                  >
                    <Mail className='size-4 text-gray-400 group-hover:text-on-primary' />
                  </Link>
                  <div>
                    <p className='mb-1 text-sm font-medium text-white'>Email</p>
                    <Link
                      href={`mailto:${CONTACT.EMAIL_INFO}`}
                      className='text-sm text-gray-300 transition-colors hover:text-primary'
                    >
                      {CONTACT.EMAIL_INFO}
                    </Link>
                  </div>
                </div>

                <div className='group flex items-start'>
                  <Link
                    href={`tel:${CONTACT.PHONE}`}
                    className='mr-3 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-on-primary'
                    aria-label={`Llamar al teléfono: ${CONTACT.PHONE}`}
                  >
                    <Phone className='size-4 text-gray-400 group-hover:text-on-primary' />
                  </Link>
                  <div>
                    <p className='mb-1 text-sm font-medium text-white'>Teléfono</p>
                    <Link
                      href={`tel:${CONTACT.PHONE}`}
                      className='text-sm text-gray-300 transition-colors hover:text-primary'
                    >
                      {CONTACT.PHONE}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-white'>Enlaces</h3>
              <div className='space-y-3'>
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className='group flex items-center'
                  >
                    <div className='mr-3 size-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-125 group-hover:bg-primary'></div>
                    <span className='text-sm text-gray-300 transition-colors duration-300 group-hover:text-white'>
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-white'>Redes Sociales</h3>
              <div className='space-y-4'>
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className='group flex items-center'
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={`Visitar ${social.name}: ${social.handle}`}
                    >
                      <div className='mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:shadow-elevation-2'>
                        <IconComponent className='size-4 text-gray-400 group-hover:text-on-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-white'>{social.name}</p>
                        <p className='text-xs text-gray-400 transition-colors group-hover:text-primary'>
                          {social.handle}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          <div className='mt-12 border-t border-gray-700 pt-8'>
            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
              <p className='text-sm text-gray-400'>
                © {new Date().getFullYear()} Impulso Galería. Todos los derechos reservados.
              </p>
              <div className='flex items-center gap-4'>
                <Link
                  href={ROUTES.STORE.TERMS.PATH}
                  className='text-xs text-gray-400 transition-colors hover:text-primary'
                >
                  Términos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}