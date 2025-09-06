// Componente Loader para Events
import { Card, CardContent } from '@/components/ui/card'

export const Loader = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className='bg-card shadow-elevation-1'>
        <div className='aspect-[4/3] animate-pulse bg-muted' />
        <CardContent className='space-y-3 p-4'>
          <div className='flex gap-2'>
            <div className='h-5 w-20 animate-pulse rounded-full bg-muted' />
            <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
          </div>
          <div className='space-y-2'>
            <div className='h-6 w-full animate-pulse rounded bg-muted' />
            <div className='h-6 w-3/4 animate-pulse rounded bg-muted' />
          </div>
          <div className='space-y-2'>
            {[ 1, 2, 3 ].map((i) => (
              <div key={i} className='h-4 w-full animate-pulse rounded bg-muted' />
            ))}
          </div>
          <div className='flex justify-between pt-2'>
            <div className='h-4 w-24 animate-pulse rounded bg-muted' />
            <div className='h-4 w-16 animate-pulse rounded bg-muted' />
          </div>
        </CardContent>
      </Card>
    ))}
  </>
)
