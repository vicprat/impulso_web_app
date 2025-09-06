import { Palette } from 'lucide-react'

import { type Product } from '@/modules/shopify/types'

import { Carousel } from './Carousel'

interface Props {
  data: Product[]
}

export const Products: React.FC<Props> = ({ data }) => {
  return (
    <>

      {data.length > 0 && (
        <div className='animate-fade-in-up'>
          <Carousel products={data.slice(0, 8)} title='' subtitle='' />
        </div>
      )}

      {data.length === 0 && (
        <div className='animate-fade-in-up py-16 text-center'>
          <div className='mx-auto mb-6 flex size-24 animate-scale-in items-center justify-center rounded-full bg-muted' style={{ animationDelay: '0.2s' }}>
            <Palette className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 animate-fade-in-up text-xl font-semibold text-foreground' style={{ animationDelay: '0.3s' }}>Curando nuevas obras</h3>
          <p className='animate-fade-in-up text-muted-foreground' style={{ animationDelay: '0.4s' }}>
            Estamos seleccionando piezas extraordinarias para ti
          </p>
        </div>
      )}
    </>
  )
}
