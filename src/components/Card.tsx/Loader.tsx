import { Skeleton } from '@/components/ui/skeleton'

import { Container } from './Container'

export const Loader = () => (
  <div className='bg-surface min-h-screen'>
    <Container>
      {Array.from({ length: 24 }, (_, i) => (
        <div className='bg-surface-container overflow-hidden rounded-xl shadow-sm' key={i}>
          <Skeleton className='aspect-square w-full bg-zinc-400' />
          <div className='space-y-3 p-4'>
            <Skeleton className='h-4 w-full bg-zinc-400' />
            <Skeleton className='h-3 w-2/3 bg-zinc-400' />
            <Skeleton className='h-5 w-1/3 bg-zinc-400' />
          </div>
        </div>
      ))}
    </Container>
  </div>
)
