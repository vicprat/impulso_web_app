'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'

import { AnimatedSpheres, FloatingParticles, GradientBackground } from '@/components/Animations'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const companyDescription =
    'Una experiencia inmersiva donde cada obra cuenta una historia única. Explora. Descubre. Transforma.'
  const contactEmail = 'soporte@impulsogaleria.com'

  return (
    <>
      <Header.Public />
      <GradientBackground className='absolute inset-0' />

      {/* Large animated spheres */}
      <AnimatedSpheres className='absolute inset-0' />

      {/* Floating particles */}
      <FloatingParticles
        config={{
          color: 'bg-gray-800/50 dark:bg-white/75',
          count: 200,
          maxDuration: 8,
          minDuration: 2,
        }}
      />

      {/* Mobile Layout */}
      <div className='relative flex min-h-screen flex-col justify-center overflow-hidden lg:hidden'>
        <div className='relative z-10 p-4 md:p-8'>
          <div className='mx-auto max-w-sm'>
            {/* Logo for mobile */}
            <div className='mb-8 text-center'>
              <div className='mb-12 flex w-full justify-center'>
                <Logo />
              </div>
              <h1 className='mb-2 text-2xl font-bold'>Bienvenido</h1>
              <p className=' text-sm'>Accede a tu cuenta</p>
            </div>

            {children}

            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-400'>
                ¿Necesitas ayuda?{' '}
                {/* TODO: ROUTING - Handle mailto links if they should be part of ROUTES */}
                <Link
                  href={`mailto:${contactEmail}`}
                  className='font-semibold text-orange-400 transition-colors hover:text-orange-300'
                >
                  Contáctanos
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className='hidden min-h-screen lg:flex'>
        {/* Left Panel - Welcome Section */}
        <div className='relative flex w-1/2 items-center justify-center overflow-hidden'>
          {/* Content */}
          <div className='relative z-10 max-w-lg px-12'>
            <div className='mb-8'>
              <div className='relative mb-6 inline-block'>
                <div className='absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 blur-xl' />
              </div>

              <h1 className='mb-6 text-5xl  font-black leading-tight'>Bienvenido</h1>
            </div>

            <div className='mb-8 flex items-center'>
              <Logo />
            </div>

            <p className=' mb-8 text-lg leading-relaxed'>{companyDescription}</p>

            <div className='rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl'>
              <h3 className='mb-3 text-lg font-bold text-white'>¿Necesitas ayuda?</h3>
              <p className='mb-4 text-sm leading-relaxed text-white/70'>
                Si tienes alguna duda o problema para acceder a tu cuenta, contáctanos y te
                ayudaremos.
              </p>
              {/* TODO: ROUTING - Handle mailto links if they should be part of ROUTES */}
              <Link href={`mailto:${contactEmail}`}>
                <Button className='w-full font-semibold text-white '>Contactar Soporte</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className='relative flex w-1/2 items-center justify-center overflow-hidden p-8'>
          <div className='relative z-10 w-full max-w-md'>
            {children}

            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-400'>
                ¿Necesitas ayuda?{' '}
                <Link
                  href={`mailto:${contactEmail}`}
                  className='hover:text-primary/80 font-medium text-primary transition-colors'
                >
                  Contáctanos
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
