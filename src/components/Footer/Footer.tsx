'use client'

import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import Link from 'next/link'
import { FaTiktok } from 'react-icons/fa'

import type { NavigationLink, SocialLink } from '@/types/notion-content.types'

import {
  AnimatedSpheres,
  FloatingParticles,
  GradientBackground,
  GridOverlay,
} from '@/components/Animations'
import { ROUTES } from '@/src/config/routes'

// Icon mapping for social link names
const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook,
  Instagram,
  TikTok: FaTiktok,
  YouTube: Youtube,
}

// Fallback data
const FALLBACK_NAV_LINKS = [
  { href: ROUTES.STORE.MAIN.PATH, name: 'Galería' },
  { href: ROUTES.STORE.EVENTS.PATH, name: 'Eventos' },
  { href: ROUTES.STORE.TERMS.PATH, name: 'Términos y condiciones' },
]

const FALLBACK_SOCIAL_LINKS: SocialLink[] = [
  {
    handle: '/impulsogaleria',
    name: 'Facebook',
    order: 1,
    url: 'https://facebook.com/impulsogaleria',
  },
  {
    handle: '@impulsogaleria',
    name: 'Instagram',
    order: 2,
    url: 'https://instagram.com/impulsogaleria',
  },
  {
    handle: '@impulsogaleria',
    name: 'YouTube',
    order: 3,
    url: 'https://youtube.com/@impulsogaleria',
  },
  {
    handle: '@impulsogaleria',
    name: 'TikTok',
    order: 4,
    url: 'https://tiktok.com/@impulsogaleria',
  },
]

interface FooterClientProps {
  contactContent?: Record<string, { en: string; es: string }>
  footerContent?: Record<string, { en: string; es: string }>
  navigationLinks?: NavigationLink[]
  socialLinks?: SocialLink[]
}

export const FooterClient = ({
  contactContent = {},
  footerContent = {},
  navigationLinks = [],
  socialLinks = [],
}: FooterClientProps) => {
  const tc = (key: string, fallback: string) => contactContent[key]?.es ?? fallback
  const tf = (key: string, fallback: string) => footerContent[key]?.es ?? fallback

  const address = tc(
    'contact.address',
    'Hacienda Escolásticas 107, Jardines de la Hacienda, 76180 Santiago de Querétaro, Querétaro.'
  )
  const email = tc('contact.email', 'info@impulsogaleria.com')
  const phone = tc('contact.phone', '4425826262')

  const resolvedNavLinks =
    navigationLinks.length > 0
      ? navigationLinks.map((l) => ({ href: l.path, name: l.name.es }))
      : FALLBACK_NAV_LINKS

  const resolvedSocialLinks = socialLinks.length > 0 ? socialLinks : FALLBACK_SOCIAL_LINKS

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
              <h3 className='mb-6 text-lg font-semibold text-white'>
                {tf('footer.contact.heading', 'Contacto')}
              </h3>
              <div className='space-y-4'>
                <div className='group flex items-start'>
                  <Link
                    href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mr-3 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-on-primary'
                    aria-label={`Ver ubicación en Google Maps: ${address}`}
                  >
                    <MapPin className='size-4 text-gray-400 group-hover:text-on-primary' />
                  </Link>
                  <div>
                    <p className='mb-1 text-sm font-medium text-white'>
                      {tf('footer.contact.addressLabel', 'Dirección')}
                    </p>
                    <p className='text-sm leading-relaxed text-gray-300'>{address}</p>
                  </div>
                </div>

                <div className='group flex items-start'>
                  <Link
                    href={`mailto:${email}`}
                    className='mr-3 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-on-primary'
                    aria-label={`Enviar email a: ${email}`}
                  >
                    <Mail className='size-4 text-gray-400 group-hover:text-on-primary' />
                  </Link>
                  <div>
                    <p className='mb-1 text-sm font-medium text-white'>
                      {tf('footer.contact.emailLabel', 'Email')}
                    </p>
                    <Link
                      href={`mailto:${email}`}
                      className='text-sm text-gray-300 transition-colors hover:text-primary'
                    >
                      {email}
                    </Link>
                  </div>
                </div>

                <div className='group flex items-start'>
                  <Link
                    href={`tel:${phone}`}
                    className='mr-3 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-800 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-on-primary'
                    aria-label={`Llamar al teléfono: ${phone}`}
                  >
                    <Phone className='size-4 text-gray-400 group-hover:text-on-primary' />
                  </Link>
                  <div>
                    <p className='mb-1 text-sm font-medium text-white'>
                      {tf('footer.contact.phoneLabel', 'Teléfono')}
                    </p>
                    <Link
                      href={`tel:${phone}`}
                      className='text-sm text-gray-300 transition-colors hover:text-primary'
                    >
                      {phone}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-white'>
                {tf('footer.links.heading', 'Enlaces')}
              </h3>
              <div className='space-y-3'>
                {resolvedNavLinks.map((link) => (
                  <Link key={link.name} href={link.href} className='group flex items-center'>
                    <div className='mr-3 size-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-125 group-hover:bg-primary'></div>
                    <span className='text-sm text-gray-300 transition-colors duration-300 group-hover:text-white'>
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='mb-6 text-lg font-semibold text-white'>
                {tf('footer.social.heading', 'Redes Sociales')}
              </h3>
              <div className='space-y-4'>
                {resolvedSocialLinks.map((social) => {
                  const IconComponent = SOCIAL_ICONS[social.name]
                  if (!IconComponent) return null
                  return (
                    <Link
                      key={social.name}
                      href={social.url}
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
                {tf(
                  'footer.copyright',
                  `© ${new Date().getFullYear()} Impulso Galería. Todos los derechos reservados.`
                )}
              </p>
              <div className='flex items-center gap-4'>
                <Link
                  href={ROUTES.STORE.TERMS.PATH}
                  className='text-xs text-gray-400 transition-colors hover:text-primary'
                >
                  {tf('footer.termsLink', 'Términos de Uso')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
