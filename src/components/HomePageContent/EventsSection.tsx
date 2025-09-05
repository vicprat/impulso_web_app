'use client'

import { Calendar } from 'lucide-react'

import { EventCarousel } from '@/components/EventCarousel'
import { type Event } from '@/models/Event'

interface Props {
  events: Event[]
}

export const Events: React.FC<Props> = ({ events }) => {
  return (
    <>
      {events.length > 0 ? (
        <div className='animate-fade-in-up'>
          <EventCarousel events={events.slice(0, 4)} title='' subtitle='' />
        </div>
      ) : (
        <div className='py-16 text-center animate-fade-in-up'>
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted animate-scale-in' style={{ animationDelay: '0.2s' }}>
            <Calendar className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-xl font-semibold text-foreground animate-fade-in-up' style={{ animationDelay: '0.3s' }}>
            Nuevos eventos próximamente
          </h3>
          <p className='text-muted-foreground animate-fade-in-up' style={{ animationDelay: '0.4s' }}>
            Estamos organizando experiencias increíbles para ti
          </p>
        </div>
      )}
    </>
  )
}