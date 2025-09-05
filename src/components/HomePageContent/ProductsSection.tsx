'use client'

import { Palette } from 'lucide-react'

import { ProductCarousel } from '@/components/ProductCarousel'
import { type Product } from '@/modules/shopify/types'

interface ProductsSectionProps {
  products: Product[]
}

export function ProductsSection({ products }: ProductsSectionProps) {
  return (
    <>

      {products.length > 0 && (
        <div className='animate-fade-in-up'>
          <ProductCarousel products={products.slice(0, 8)} title='' subtitle='' />
        </div>
      )}

      {products.length === 0 && (
        <div className='py-16 text-center animate-fade-in-up'>
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted animate-scale-in' style={{ animationDelay: '0.2s' }}>
            <Palette className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-xl font-semibold text-foreground animate-fade-in-up' style={{ animationDelay: '0.3s' }}>Curando nuevas obras</h3>
          <p className='text-muted-foreground animate-fade-in-up' style={{ animationDelay: '0.4s' }}>
            Estamos seleccionando piezas extraordinarias para ti
          </p>
        </div>
      )}
    </>
  )
}
