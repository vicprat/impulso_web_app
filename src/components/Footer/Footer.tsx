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
import { Card } from '@/components/ui/card'
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
    <footer className='relative overflow-hidden'>
      {/* Animated background using GradientBackground */}
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

      {/* Grid pattern overlay */}
      <GridOverlay />

      <div className='relative z-10'>
        <div className='container mx-auto px-4 py-12 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>

            {/* Column 1: Logos */}
            <div className='space-y-4'>
              <Card className='space-y-6 bg-white p-6 shadow-elevation-2'>
                <div className='flex flex-col items-center space-y-6'>
                  {/* Logo container con altura fija para todos */}
                  <div className='flex h-16 w-full items-center justify-center'>
                    <img
                      src='/assets/logo.png'
                      alt='Impulso Galería'
                      className='max-h-16 max-w-full object-contain transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                  <div className='flex h-32 w-full items-center justify-center'>
                    <img
                      src='/assets/collective.png'
                      alt='Collective'
                      className='max-h-32 max-w-full object-contain transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                  <div className='flex h-16 w-full items-center justify-center'>
                    <img
                      src='/assets/berraco.png'
                      alt='Berraco'
                      className='max-h-16 max-w-full object-contain transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Column 2: Contact Information */}
            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-foreground'>Contacto</h3>
              <div className='space-y-4'>
                <div className='group flex items-start'>
                  <div className='mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container transition-colors group-hover:bg-primary group-hover:text-on-primary'>
                    <MapPin className='size-4 text-white group-hover:text-on-primary' />
                  </div>
                  <div>
                    <p className='mb-1 text-sm font-medium text-foreground'>Dirección</p>
                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      Hacienda Escolásticas 107, Jardines de la Hacienda, 76180 Santiago de Querétaro, Querétaro.
                    </p>
                  </div>
                </div>

                <div className='group flex items-start'>
                  <div className='mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container transition-colors group-hover:bg-primary group-hover:text-on-primary'>
                    <Mail className='size-4 text-white group-hover:text-on-primary' />
                  </div>
                  <div>
                    <p className='mb-1 text-sm font-medium text-foreground'>Email</p>
                    <Link
                      href='mailto:info@impulsogaleria.com'
                      className='text-sm text-muted-foreground transition-colors hover:text-primary'
                    >
                      info@impulsogaleria.com
                    </Link>
                  </div>
                </div>

                <div className='group flex items-start'>
                  <div className='mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container transition-colors group-hover:bg-primary group-hover:text-on-primary'>
                    <Phone className='size-4 text-white group-hover:text-on-primary' />
                  </div>
                  <div>
                    <p className='mb-1 text-sm font-medium text-foreground'>Teléfono</p>
                    <Link
                      href='tel:+524428317333'
                      className='text-sm text-muted-foreground transition-colors hover:text-primary'
                    >
                      +52 442 831 73 33
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Navigation Links */}
            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-foreground'>Enlaces</h3>
              <div className='space-y-3'>
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className='group flex items-center'
                  >
                    <div className='mr-3 size-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-125 group-hover:bg-primary'></div>
                    <span className='text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground'>
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 4: Social Media Links */}
            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-foreground'>Redes Sociales</h3>
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
                    >
                      <div className='mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:shadow-elevation-2'>
                        <IconComponent className='size-4 text-muted-foreground group-hover:text-on-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-foreground'>{social.name}</p>
                        <p className='text-xs text-muted-foreground transition-colors group-hover:text-primary'>
                          {social.handle}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className='mt-12 border-t border-border pt-8'>
            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
              <p className='text-sm text-muted-foreground'>
                © {new Date().getFullYear()} Impulso Galería. Todos los derechos reservados.
              </p>
              <div className='flex items-center gap-4'>
                <Link
                  href={ROUTES.STORE.TERMS.PATH}
                  className='text-xs text-muted-foreground transition-colors hover:text-primary'
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