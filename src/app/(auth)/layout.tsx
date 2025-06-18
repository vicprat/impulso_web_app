 
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  AnimatedSpheres,
  FloatingParticles,
  GradientBackground,
} from '@/components/Animations';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  
  const companyDescription = 'Una experiencia inmersiva donde cada obra cuenta una historia única. Explora. Descubre. Transforma.';
  const contactEmail = 'soporte@impulsogaleria.com';

  return (
    <>
      <Header.Public />
        <GradientBackground 
        className="absolute inset-0"
      />
          
          {/* Large animated spheres */}
        <AnimatedSpheres
          className="absolute inset-0"
        />

          {/* Floating particles */}
          <FloatingParticles 
            config={{
              count: 200,
              color: 'bg-gray-800/50 dark:bg-white/75',
              minDuration: 2,
              maxDuration: 8
            }}
          />
      
      {/* Mobile Layout */}
      <div className="flex min-h-screen flex-col justify-center lg:hidden relative overflow-hidden">
   

        <div className="relative z-10 p-4 md:p-8">
          <div className="mx-auto max-w-sm">
            {/* Logo for mobile */}
            <div className="mb-8 text-center">
              <div className='w-full flex justify-center mb-12'>
                <Logo />
              </div>
              <h1 className="text-2xl font-bold mb-2">Bienvenido</h1>
              <p className=" text-sm">Accede a tu cuenta</p>
            </div>
            
            {children}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                ¿Necesitas ayuda?{' '}
                <Link 
                  href={`mailto:${contactEmail}`} 
                  className="font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Contáctanos
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Panel - Welcome Section */}
        <div 
          className="w-1/2 relative overflow-hidden flex items-center justify-center"
        >
      
          
          {/* Content */}
          <div className="relative z-10 max-w-lg px-12">
            <div className="mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-xl" />
              </div>
              
              <h1 className="text-5xl font-black  mb-6 leading-tight">
                Bienvenido
              </h1>
            </div>
            
            <div className="flex items-center mb-8">
               <Logo />
               
            </div>
            
            <p className=" mb-8 text-lg leading-relaxed">
              {companyDescription}
            </p>
            
            <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold mb-3 text-white text-lg">¿Necesitas ayuda?</h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Si tienes alguna duda o problema para acceder a tu cuenta, 
                contáctanos y te ayudaremos.
              </p>
              <Link 
                href={`mailto:${contactEmail}`} 
                 >
                  <Button className=" rounded-lg  font-bold "
             >

                Contactar Soporte
                  </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Form Section */}
        <div className="w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        
          <div className="w-full max-w-md relative z-10">
            {children}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                ¿Necesitas ayuda?{' '}
                <Link 
                  href={`mailto:${contactEmail}`} 
                  className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                >
                  Contáctanos
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}