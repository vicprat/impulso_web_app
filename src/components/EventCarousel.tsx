'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'

import { Card } from '@/components/Card'
import { type Event } from '@/models/Event'

interface EventCarouselProps {
  events: Event[]
  title: string
  subtitle?: string
  autoplay?: boolean
  scrollSpeed?: number
  stopOnInteraction?: boolean
}

export const EventCarousel: React.FC<EventCarouselProps> = ({
  events,
  title,
  subtitle,
  autoplay = true,
  scrollSpeed = 1,
  stopOnInteraction = false,
}) => {
  const duplicatedEvents = [ ...events, ...events, ...events ]

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

  if (events.length === 0) {
    return null
  }

  return (
    <div className='mt-16 lg:mt-24'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-foreground sm:text-3xl'>
          {title}
        </h2>
        {subtitle && (
          <p className='mt-2 text-muted-foreground'>{subtitle}</p>
        )}
      </div>

      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-4 md:gap-6'>
          {duplicatedEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              className='w-64 flex-none sm:w-72 md:w-80'
            >
              <Card.Product product={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 