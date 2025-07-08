'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'

import { AnimatedSpheres, GradientBackground } from '@/components/Animations'
import { Filter } from '@/components/Filter'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Navigation } from '@/components/Navigation'

export function StoreLayoutContent({ children }: { children: React.ReactNode }) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const searchParams = useSearchParams()

  const activeFiltersCount = useMemo(() => {
    let count = 0

    const collections = searchParams.get('collections')
    const productTypes = searchParams.get('product_types')
    const vendors = searchParams.get('vendors')
    const tags = searchParams.get('tags')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    const availability = searchParams.get('availability')

    if (collections && collections.split(',').filter(Boolean).length > 0) count++
    if (productTypes && productTypes.split(',').filter(Boolean).length > 0) count++
    if (vendors && vendors.split(',').filter(Boolean).length > 0) count++
    if (tags && tags.split(',').filter(Boolean).length > 0) count++
    if (priceMin || priceMax) count++
    if (availability && availability !== 'all') count++

    return count
  }, [searchParams])

  const handleOpenFilters = () => {
    setIsFilterDialogOpen(true)
  }

  const handleCloseFilters = () => {
    setIsFilterDialogOpen(false)
  }

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Background using GradientBackground component */}
      <GradientBackground className='fixed inset-0 z-0' />

      {/* Animated spheres */}
      <AnimatedSpheres className='fixed inset-0 z-0' />

      {/* Contenido principal */}
      <div className='relative z-10'>
        <main className='w-full'>
          <Header.Public />

          <div className='container mx-auto px-6 py-8'>
            <Navigation.Store
              onOpenFilters={handleOpenFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          <div className='container mx-auto px-6 py-8'>{children}</div>
        </main>

        <Footer />

        <Filter isOpen={isFilterDialogOpen} onClose={handleCloseFilters} />
      </div>
    </div>
  )
}
