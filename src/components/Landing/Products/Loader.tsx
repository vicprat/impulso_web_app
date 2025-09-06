// Componente Loader para Products
import { Card, CardContent } from '@/components/ui/card'

export const Loader = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className='bg-card shadow-elevation-1'>
        <div className='aspect-square animate-pulse bg-muted' />
        <CardContent className='space-y-3 p-4'>
          <div className='space-y-2'>
            <div className='h-6 w-full animate-pulse rounded bg-muted' />
            <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
          </div>
          <div className='space-y-2'>
            {[ 1, 2 ].map((i) => (
              <div key={i} className='h-4 w-full animate-pulse rounded bg-muted' />
            ))}
          </div>
          <div className='flex justify-between pt-2'>
            <div className='h-5 w-20 animate-pulse rounded bg-muted' />
            <div className='h-4 w-16 animate-pulse rounded bg-muted' />
          </div>
        </CardContent>
      </Card>
    ))}
  </>
)
