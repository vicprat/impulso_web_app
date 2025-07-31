'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'

import { Card } from '@/components/Card'
import { type Product } from '@/modules/shopify/types'

interface ProductCarouselProps {
  products: Product[]
  title: string
  subtitle?: string
  showNavigation?: boolean
  autoplay?: boolean
  scrollSpeed?: number
  stopOnInteraction?: boolean
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  subtitle,
  autoplay = true,
  scrollSpeed = 1,
  stopOnInteraction = false,
}) => {
  const duplicatedProducts = [ ...products, ...products, ...products ]

  const [ emblaRef, emblaApi ] = useEmblaCarousel(
    {
      align: 'start',
      dragFree: true,
      loop: true,
      skipSnaps: false,
      containScroll: false,
      slidesToScroll: 1,
    },
    autoplay ? [
      AutoScroll({
        playOnInit: true,
        speed: scrollSpeed,
        stopOnInteraction,
        stopOnMouseEnter: true,
        stopOnFocusIn: false,
        direction: 'forward',
      })
    ] : []
  )

  if (products.length === 0) {
    return null
  }

  return (
    <div className='mt-16 lg:mt-24'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-foreground sm:text-3xl'>
            {title}
          </h2>
          {subtitle && (
            <p className='mt-2 text-muted-foreground'>{subtitle}</p>
          )}
        </div>
      </div>

      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-4 md:gap-6'>
          {duplicatedProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className='w-64 flex-none sm:w-72 md:w-80'
            >
              <Card.Product product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}