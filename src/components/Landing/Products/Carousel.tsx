'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'

import { Card } from '@/components/Card'
import { type Product } from '@/modules/shopify/types'

interface Props {
  products: Product[]
  title: string
  subtitle?: string
  showNavigation?: boolean
  autoplay?: boolean
  scrollSpeed?: number
  stopOnInteraction?: boolean
}

export const Carousel: React.FC<Props> = ({
  autoplay = true,
  products,
  scrollSpeed = 1,
  stopOnInteraction = false,
  subtitle,
  title,
}) => {
  const duplicatedProducts = [ ...products, ...products, ...products ]

  const [ emblaRef, emblaApi ] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: false,
      dragFree: true,
      loop: true,
      skipSnaps: false,
      slidesToScroll: 1,
    },
    autoplay ? [
      AutoScroll({
        direction: 'forward',
        playOnInit: true,
        speed: scrollSpeed,
        stopOnFocusIn: false,
        stopOnInteraction,
        stopOnMouseEnter: true,
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