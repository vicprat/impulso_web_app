import { Suspense } from 'react'

import { Content } from './components'

interface Props {
  onOpenFilters?: () => void
  activeFiltersCount?: number
}

export const Store: React.FC<Props> = ({ activeFiltersCount, onOpenFilters }) => {
  return (
    <Suspense
      fallback={
        <nav className='mb-6 border-b border-gray-200 bg-white'>
          <div className='flex items-center justify-between py-4'>
            <div className='h-6 w-48 animate-pulse rounded bg-gray-200'></div>
            <div className='h-8 w-32 animate-pulse rounded bg-gray-200'></div>
          </div>
        </nav>
      }
    >
      <Content onOpenFilters={onOpenFilters} activeFiltersCount={activeFiltersCount} />
    </Suspense>
  )
}
