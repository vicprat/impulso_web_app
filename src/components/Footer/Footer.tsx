/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { 
  AnimatedSpheres, 
  FloatingParticles, 
  GradientBackground, 
  GridOverlay, 
} from '@/components/Animations';
import { Button } from '../ui/button';

const navigationLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Tienda', href: '/tienda' },
  { name: 'Colecciones', href: '/colecciones' },
  { name: 'Artistas', href: '/artistas' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Contacto', href: '/contacto' }
];

const socialLinks = [
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'YouTube', href: '#', icon: Youtube }
];

const legalLinks = [
  { name: 'Términos y Condiciones', href: '/terminos' },
  { name: 'Política de Privacidad', href: '/privacidad' },
  { name: 'Política de Devoluciones', href: '/devoluciones' },
  { name: 'Envíos y Entregas', href: '/envios' }
];

export const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = () => {
    if (email) {
      console.log('Newsletter subscription:', email);
      setEmail('');
      // Aquí iría la lógica real de suscripción
    }
  };

  return (
    <footer 
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white"
    >
      {/* Animated background using GradientBackground */}
      <GradientBackground 
        className="absolute inset-0"
      />
      
      {/* Animated spheres */}
      <AnimatedSpheres 
      />

      {/* Floating particles */}
     <FloatingParticles 
            config={{
              count: 50,
              color: 'bg-white/30',
              minDuration: 2,
              maxDuration: 5
            }}
          />

      {/* Grid pattern overlay */}
      <GridOverlay />

      <div className="relative z-10">
        {/* Main footer content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img 
                  src="/assets/logo2.svg" 
                  alt="Logo" 
                  className="h-full w-auto max-w-32 sm:max-w-40 lg:max-w-64 object-contain " 
                />
              </div>
              
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-300 hover:text-white transition-colors group">
                  <MapPin className="w-4 h-4 mr-3 text-white transition-colors" />
                  <span className="text-sm">Querétaro, México</span>
                </div>
                <div className="flex items-center text-gray-300 hover:text-white transition-colors group">
                  <Phone className="w-4 h-4 mr-3 text-white transition-colors" />
                  <span className="text-sm">+52 55 1234 5678</span>
                </div>
                <div className="flex items-center text-gray-300 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 mr-3 text-white transition-colors" />
                  <span className="text-sm">hola@impulsogaleria.com</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-white mb-6">Navegación</h3>
              <ul className="space-y-3">
                {navigationLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 group flex items-center"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-white mb-6">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 group flex items-center"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300 text-sm">
                        {link.name}
                      </span>
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-white mb-6">Newsletter</h3>
              <p className="text-gray-300 mb-4 text-sm">
                Mantente al día con nuestras últimas colecciones y eventos exclusivos.
              </p>
              
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="flex-1 px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
                  />
                  <Button 
                    variant="secondary"
                    onClick={handleNewsletterSubmit}
                    className="px-6 py-3 "
                  >
                    Suscribirse
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Síguenos</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <Link
                        key={social.name}
                        href={social.href}
                        className="w-10 h-10 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-400/20 hover:to-pink-500/20 transition-all duration-300 group"
                        aria-label={social.name}
                      >
                        <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};