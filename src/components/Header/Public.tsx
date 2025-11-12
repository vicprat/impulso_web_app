'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { RegistrationBanner } from '@/components/Banner'
import { MiniCart } from '@/components/Cart/MiniCart'
import { Logo } from '@/components/Logo'
import { getStoreNavRoutes } from '@/config/routes'
import { useAuth } from '@/src/modules/auth/context/useAuth'

import { SearchTrigger } from './components/SearchTrigger'
import { ThemeSwitch } from './components/ThemeSwitch'
import { UserMenu } from './components/UserMenu'

interface PublicHeaderProps {
  isHomePage?: boolean
}

export function Public({ isHomePage = false }: PublicHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [sphere1Pos, setSphere1Pos] = useState({ x: 15, y: 20 })
  const [sphere2Pos, setSphere2Pos] = useState({ x: 85, y: 70 })
  const [sphere3Pos, setSphere3Pos] = useState({ x: 60, y: 15 })
  const { user } = useAuth()
  const pathname = usePathname()
  const [hoveredPath, setHoveredPath] = useState('')

  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const getRandomMenuPosition = (currentPos: { x: number; y: number }) => {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 30

    let newX = currentPos.x + Math.cos(angle) * distance
    let newY = currentPos.y + Math.sin(angle) * distance

    newX = Math.max(10, Math.min(90, newX))
    newY = Math.max(10, Math.min(90, newY))

    return { x: newX, y: newY }
  }

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const interval1 = setInterval(() => {
      setSphere1Pos((prev) => getRandomMenuPosition(prev))
    }, 6000)

    const interval2 = setInterval(() => {
      setSphere2Pos((prev) => getRandomMenuPosition(prev))
    }, 8000)

    const interval3 = setInterval(() => {
      setSphere3Pos((prev) => getRandomMenuPosition(prev))
    }, 7000)

    return () => {
      clearInterval(interval1)
      clearInterval(interval2)
      clearInterval(interval3)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header
        className={`${isHomePage ? 'fixed shadow-md' : 'sticky'} bg-background/95 supports-[backdrop-filter]:bg-background/60 top-0 z-50 w-full translate-y-0 border-b backdrop-blur transition-transform duration-300 ease-in-out`}
      >
        <RegistrationBanner />
        <div className='container mx-auto px-3 sm:px-4 lg:px-6'>
          <div className='flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4'>
            {/* Logo - empujado a la izquierda */}
            <div className='flex items-center gap-2 sm:gap-3'>
              <div className='h-6 max-w-48 px-2 sm:h-10 lg:mt-2 lg:h-12'>
                <Logo />
              </div>
            </div>

            {/* SearchTrigger centrado en desktop */}
            <div className='hidden lg:flex lg:max-w-md lg:flex-1 lg:justify-center'>
              <SearchTrigger />
            </div>

            <div className='mx-auto hidden max-w-md flex-1 sm:block lg:hidden'>
              <SearchTrigger />
            </div>

            <div className='flex items-center gap-1 sm:gap-2'>
              <nav className='hidden lg:mr-4 lg:flex'>
                <div className='flex items-center space-x-6'>
                  {getStoreNavRoutes().map((route) => {
                    const isActive = pathname === route.PATH
                    const isHovered = hoveredPath === route.PATH

                    return (
                      <div
                        key={route.PATH}
                        className='relative'
                        onMouseEnter={() => setHoveredPath(route.PATH)}
                        onMouseLeave={() => setHoveredPath('')}
                      >
                        <Link
                          href={route.PATH}
                          className='text-foreground/80 text-sm font-medium transition-colors xl:text-base'
                        >
                          {route.LABEL}
                        </Link>

                        {isActive && (
                          <motion.div
                            className='absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-current'
                            layoutId='desktop-active-underline'
                            initial={false}
                            animate={{ scaleX: 1 }}
                            transition={{ damping: 30, stiffness: 500, type: 'spring' }}
                          />
                        )}

                        {isHovered && !isActive && (
                          <motion.div
                            className='absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-current opacity-60'
                            layoutId='desktop-hover-underline'
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0 }}
                            style={{ transformOrigin: 'left' }}
                            transition={{ damping: 30, stiffness: 500, type: 'spring' }}
                          />
                        )}
                      </div>
                    )
                  })}

                  {/* Enlace Experiencias */}
                  <div className='relative'>
                    <Link
                      href='https://collectiveart.mx/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-foreground/80 text-sm font-medium transition-colors xl:text-base'
                    >
                      Experiencias
                    </Link>
                  </div>
                </div>
              </nav>

              {user && <MiniCart />}

              <div className='hidden sm:block'>
                <UserMenu />
              </div>

              <ThemeSwitch />

              <div className='sm:hidden'>
                <SearchTrigger />
              </div>

              <button
                onClick={toggleMobileMenu}
                className='relative z-50 rounded-md p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring lg:hidden'
                aria-label='Toggle menu'
              >
                <div className='relative size-5'>
                  <Menu
                    className={`absolute inset-0 size-5 transition-all duration-300 ${
                      isMobileMenuOpen
                        ? 'rotate-180 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100'
                    }`}
                  />
                  <X
                    className={`absolute inset-0 size-5 transition-all duration-300 ${
                      isMobileMenuOpen
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-180 scale-0 opacity-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className='absolute inset-0 bg-background backdrop-blur-xl'>
          <div className='absolute inset-0 bg-gradient-to-br from-background to-background'></div>
          <div className='absolute inset-0 bg-gradient-to-tl via-transparent'></div>

          <div
            className='absolute size-64 rounded-full bg-gradient-to-br opacity-40 blur-3xl md:size-80'
            style={{
              left: `${sphere1Pos.x}%`,
              top: `${sphere1Pos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          ></div>

          <div
            className='absolute size-48 rounded-full bg-gradient-to-bl opacity-30 blur-2xl md:size-60'
            style={{
              left: `${sphere2Pos.x}%`,
              top: `${sphere2Pos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 8s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          ></div>

          <div
            className='absolute size-32 rounded-full bg-gradient-to-tr opacity-50 blur-xl md:size-40'
            style={{
              left: `${sphere3Pos.x}%`,
              top: `${sphere3Pos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 7s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          ></div>
        </div>

        <div className='relative flex h-full flex-col'>
          <div className='h-14 sm:h-16'></div>

          <div className='flex flex-1 flex-col justify-center p-8 md:px-16'>
            <nav className='space-y-1'>
              {getStoreNavRoutes().map((route, index) => {
                const isActive = pathname === route.PATH
                const isHovered = hoveredPath === route.PATH

                return (
                  <div
                    key={route.PATH}
                    className={`relative transition-all duration-700 ease-out ${
                      isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                    }`}
                    style={{
                      transitionDelay: `${isMobileMenuOpen ? index * 100 + 200 : 0}ms`,
                    }}
                    onMouseEnter={() => setHoveredPath(route.PATH)}
                    onMouseLeave={() => setHoveredPath('')}
                  >
                    <Link
                      href={route.PATH}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className='block py-3 text-4xl font-bold tracking-tight text-foreground transition-all duration-300 hover:translate-x-4 hover:scale-105 sm:text-5xl md:text-6xl'
                    >
                      {route.LABEL}
                    </Link>

                    {isActive && (
                      <motion.div
                        className='absolute bottom-0 left-0 h-1 w-full rounded-full bg-current'
                        layoutId='mobile-active-underline'
                        initial={false}
                        animate={{ scaleX: 1 }}
                        transition={{ damping: 30, stiffness: 500, type: 'spring' }}
                      />
                    )}

                    {isHovered && !isActive && (
                      <motion.div
                        className='absolute bottom-0 left-0 h-1 w-full rounded-full bg-current opacity-60'
                        layoutId='mobile-hover-underline'
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        style={{ transformOrigin: 'left' }}
                        transition={{ damping: 30, stiffness: 500, type: 'spring' }}
                      />
                    )}
                  </div>
                )
              })}

              {/* Enlace Experiencias - Móvil */}
              <div
                className={`relative transition-all duration-700 ease-out ${
                  isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
                style={{
                  transitionDelay: `${isMobileMenuOpen ? getStoreNavRoutes().length * 100 + 200 : 0}ms`,
                }}
              >
                <Link
                  href='https://collectiveart.mx/'
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='block py-3 text-4xl font-bold tracking-tight text-foreground transition-all duration-300 hover:translate-x-4 hover:scale-105 sm:text-5xl md:text-6xl'
                >
                  Experiencias
                </Link>
              </div>
            </nav>
          </div>

          <div
            className={`px-8 pb-12 transition-all duration-700 ease-out md:px-16 ${
              isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{
              transitionDelay: `${isMobileMenuOpen ? (getStoreNavRoutes().length + 1) * 100 + 400 : 0}ms`,
            }}
          >
            <div className='mb-8 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent'></div>

            <div className='space-y-4'>
              <h3 className='text-lg font-semibold uppercase tracking-wider text-muted-foreground'>
                Cuenta
              </h3>
              <UserMenu />
            </div>

            <div className='border-border/50 mt-8 border-t pt-8'>
              <p className='text-sm text-muted-foreground'>
                © {new Date().getFullYear()} Impulso Galería
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
