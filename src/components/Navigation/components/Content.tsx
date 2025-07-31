'use client'

import {
  ArrowLeft,
  ChevronRight,
  FolderOpen,
  Home,
  Menu,
  SlidersHorizontal,
  Store,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/src/config/routes'

interface Props {
  onOpenFilters?: () => void
  activeFiltersCount?: number
}

export const Content: React.FC<Props> = ({ activeFiltersCount = 0, onOpenFilters }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [ mobileMenuOpen, setMobileMenuOpen ] = useState(false)
  const [ isMobile, setIsMobile ] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIsMobile()

    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  const navItems = [
    {
      description: 'Explora todo nuestro catálogo',
      exact: true,
      href: ROUTES.STORE.MAIN.PATH,
      icon: Store,
      label: 'Todos los productos',
      shortLabel: 'Productos',
    },
    {
      description: 'Descubre nuestros próximos eventos',
      exact: true,
      href: ROUTES.STORE.EVENTS.PATH,
      icon: Home,
      label: ROUTES.STORE.EVENTS.LABEL,
      shortLabel: 'Eventos',
    }
  ]

  const isSearchPage = pathname.includes('/search')
  const searchQuery = searchParams.get('q')

  const isCollectionPage = pathname.includes('/collections/') && pathname.split('/').length > 3
  const collectionHandle = isCollectionPage ? pathname.split('/').pop() : null

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <div className='relative'>

      {/* Breadcrumbs - Enhanced responsiveness */}
      {(pathname.includes('/product/') || isCollectionPage) && (
        <div >
          <div className='w-full px-3 py-2 sm:px-4 lg:px-6 lg:py-3'>
            <div className='flex items-center space-x-1 overflow-x-auto text-xs sm:space-x-2 sm:text-sm'>
              <Button
                variant='ghost'
                size='sm'
                asChild
                className='h-5 shrink-0 px-1 text-on-surface-variant hover:text-on-surface sm:h-6 sm:px-2'
              >
                <Link href='/' className='flex items-center gap-1'>
                  <Home className='size-3' />
                  <span className='hidden sm:inline'>Inicio</span>
                </Link>
              </Button>

              <ChevronRight className='text-on-surface-variant/50 size-3 shrink-0' />

              <Button
                variant='ghost'
                size='sm'
                asChild
                className='h-5 shrink-0 px-1 text-on-surface-variant hover:text-on-surface sm:h-6 sm:px-2'
              >
                <Link href={ROUTES.STORE.MAIN.PATH}>Tienda</Link>
              </Button>

              {isCollectionPage && (
                <>
                  <ChevronRight className='text-on-surface-variant/50 size-3 shrink-0' />
                  <Button
                    variant='ghost'
                    size='sm'
                    asChild
                    className='h-5 shrink-0 px-1 text-on-surface-variant hover:text-on-surface sm:h-6 sm:px-2'
                  >
                    <Link href={ROUTES.COLLECTIONS.MAIN.PATH}>
                      <span className='hidden sm:inline'>Colecciones</span>
                      <span className='sm:hidden'>Col.</span>
                    </Link>
                  </Button>
                  <ChevronRight className='text-on-surface-variant/50 size-3 shrink-0' />
                  <span className='truncate px-1 font-medium capitalize text-on-surface sm:px-2'>
                    {collectionHandle?.replace('-', ' ')}
                  </span>
                </>
              )}

              {pathname.includes('/product/') && (
                <>
                  <ChevronRight className='text-on-surface-variant/50 size-3 shrink-0' />
                  <span className='shrink-0 px-1 font-medium text-on-surface sm:px-2'>
                    Producto
                  </span>
                </>
              )}
            </div>
          </div>
          {/* Right section - Back button */}
          <div className='hidden items-center space-x-4 md:flex'>
            {(pathname.includes('/product/') || isCollectionPage) && (
              <Button
                variant='container-success'
                asChild
              >
                <Link href={ROUTES.STORE.MAIN.PATH}>
                  <ArrowLeft className='size-3.5 lg:size-4' />
                  <span className='text-sm font-medium lg:text-base'>Volver a la Galería</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}


      {/* Main navigation container */}
      <div className='w-full px-3 sm:px-4 lg:px-6'>
        <div className='flex min-h-[60px] items-center justify-between md:min-h-[70px]'>
          {/* Left section - Filters and Navigation */}
          <div className='flex flex-1 items-center space-x-2 sm:space-x-4 lg:space-x-6'>
            {/* Desktop filter button */}
            <div className='hidden lg:flex'>
              <Button
                variant='ghost'
                size='sm'
                onClick={onOpenFilters}
                className={cn(
                  'h-9 gap-2 px-3 py-2 xl:h-10 xl:px-4',
                  'text-on-surface-variant hover:text-on-surface',
                  'hover:bg-surface-container-high',
                  'transition-colors duration-200',
                  'border-outline-variant/40 hover:border-outline-variant/60 border',
                  'shadow-sm hover:shadow-md',
                  'rounded-full'
                )}
              >
                <SlidersHorizontal className='size-4' />
                <span className='text-sm font-medium xl:text-base'>Filtrar productos</span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-1 h-5 min-w-[20px] rounded-full bg-primary text-xs text-primary-foreground'
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile filter button */}
            <div className='flex lg:hidden'>
              <Button
                variant='ghost'
                size='sm'
                onClick={onOpenFilters}
                className={cn(
                  'h-8 gap-1.5 p-2 sm:h-9 sm:gap-2 sm:px-3',
                  'text-on-surface-variant hover:text-on-surface',
                  'hover:bg-surface-container-high',
                  'transition-colors duration-200',
                  'border-outline-variant/40 hover:border-outline-variant/60 border',
                  'shadow-sm hover:shadow-md',
                  'rounded-full'
                )}
              >
                <SlidersHorizontal className='size-3.5 sm:size-4' />
                <span className='text-xs font-medium sm:text-sm'>Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-1 h-4 min-w-[16px] rounded-full bg-primary text-xs text-primary-foreground'
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Desktop Navigation items */}
            <div className='hidden space-x-1 md:flex lg:space-x-2'>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href) && !isSearchPage

                return (
                  <Button
                    key={item.href}
                    variant='ghost'
                    size='sm'
                    asChild
                    className={cn(
                      'h-auto min-w-[90px] flex-col gap-1 p-2 lg:min-w-[120px] lg:px-4 lg:py-3',
                      'rounded-xl transition-all duration-200',
                      isActive
                        ? 'border-primary/20 border bg-primary-container text-on-primary-container shadow-md'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    )}
                  >
                    <Link href={item.href}>
                      <Icon
                        className={cn(
                          'mb-1 size-4 lg:size-5',
                          isActive ? 'text-primary' : 'text-on-surface-variant'
                        )}
                      />
                      <span className='text-center text-xs font-medium leading-tight lg:text-sm'>
                        {isMobile ? item.shortLabel : item.label}
                      </span>
                      <span className='text-on-surface-variant/70 hidden text-center text-xs leading-tight lg:block'>
                        {item.description}
                      </span>
                    </Link>
                  </Button>
                )
              })}

              {/* Search page indicator - Desktop */}
              {isSearchPage && (
                <div className='border-primary/20 flex h-auto min-w-[90px] flex-col gap-1 rounded-xl border bg-primary-container p-2 text-on-primary-container shadow-md lg:min-w-[120px] lg:px-4 lg:py-3'>
                  <Store className='mx-auto mb-1 size-4 text-primary lg:size-5' />
                  <span className='text-center text-xs font-medium leading-tight lg:text-sm'>
                    {searchQuery && searchQuery.length > 10
                      ? `"${searchQuery.substring(0, 10)}..."`
                      : searchQuery
                        ? `"${searchQuery}"`
                        : 'Búsqueda'}
                  </span>
                  <span className='text-on-surface-variant/70 hidden text-center text-xs leading-tight lg:block'>
                    Productos filtrados
                  </span>
                </div>
              )}

              {/* Collection page indicator - Desktop */}
              {isCollectionPage && (
                <div className='border-primary/20 flex h-auto min-w-[90px] flex-col gap-1 rounded-xl border bg-primary-container p-2 text-on-primary-container shadow-md lg:min-w-[120px] lg:px-4 lg:py-3'>
                  <FolderOpen className='mx-auto mb-1 size-4 text-primary lg:size-5' />
                  <span className='text-center text-xs font-medium capitalize leading-tight lg:text-sm'>
                    {collectionHandle?.replace('-', ' ')}
                  </span>
                  <span className='text-on-surface-variant/70 hidden text-center text-xs leading-tight lg:block'>
                    Colección especial
                  </span>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className='ml-auto flex md:hidden'>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleMobileMenu}
                className='size-8 rounded-full p-2 hover:bg-surface-container-high'
              >
                {mobileMenuOpen ? <X className='size-4' /> : <Menu className='size-4' />}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 z-50 md:hidden '>
          <div className='fixed inset-0 bg-surface' onClick={toggleMobileMenu} />
          <div className='fixed inset-x-0 top-16 bg-gray-300 shadow-lg dark:bg-gray-900'>
            <div className='space-y-2 p-4'>
              <div className='mb-2 flex items-center justify-end'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={toggleMobileMenu}
                  className='size-8 rounded-full p-2 hover:bg-surface-container-high'
                >
                  <X className='size-4' />
                </Button>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href) && !isSearchPage

                return (
                  <Button
                    key={item.href}
                    variant='ghost'
                    size='sm'
                    asChild
                    onClick={toggleMobileMenu}
                    className={cn(
                      'h-12 w-full justify-start gap-3 rounded-xl px-4',
                      isActive
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    )}
                  >
                    <Link href={item.href}>
                      <Icon
                        className={cn(
                          'size-5',
                          isActive ? 'text-primary' : 'text-on-surface-variant'
                        )}
                      />
                      <div className='flex flex-col items-start'>
                        <span className='text-sm font-medium'>{item.label}</span>
                        <span className='text-on-surface-variant/70 text-xs'>
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </Button>
                )
              })}

              {/* Mobile back button for product/collection pages */}
              {(pathname.includes('/product/') || isCollectionPage) && (
                <Button
                  variant='ghost'
                  size='sm'
                  asChild
                  onClick={toggleMobileMenu}
                  className='border-outline-variant/20 hover:text-primary/80 mt-4 h-12 w-full justify-start gap-3 rounded-xl border-t px-4 pt-6 text-primary hover:bg-primary-container'
                >
                  <Link href={ROUTES.STORE.MAIN.PATH}>
                    <ArrowLeft className='size-5' />
                    <span className='text-sm font-medium'>Volver a la tienda</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
