import { Calendar } from 'lucide-react'

import { type Event } from '@/models/Event'

import { Carousel } from './Carousel'

interface Props {
  data: Event[]
}

export const Events: React.FC<Props> = ({ data }) => {
  return (
    <>
      {data.length > 0 ? (
        <div className='animate-fade-in-up'>
          <Carousel events={data.slice(0, 4)} title='' subtitle='' />
        </div>
      ) : (
        <div className='animate-fade-in-up py-16 text-center'>
          <div className='mx-auto mb-6 flex size-24 animate-scale-in items-center justify-center rounded-full bg-muted' style={{ animationDelay: '0.2s' }}>
            <Calendar className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 animate-fade-in-up text-xl font-semibold text-foreground' style={{ animationDelay: '0.3s' }}>
            Nuevos eventos próximamente
          </h3>
          <p className='animate-fade-in-up text-muted-foreground' style={{ animationDelay: '0.4s' }}>
            Estamos organizando experiencias increíbles para ti
          </p>
        </div>
      )}
    </>
  )
}