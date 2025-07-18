import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { Content } from './components'

export const Search = () => {
  return (
    <Suspense
      fallback={
        <div className='relative w-full max-w-md'>
          <Skeleton className='h-14 w-full rounded-full bg-surface-container-high' />
        </div>
      }
    >
      <Content />
    </Suspense>
  )
}
