import { Card, CardContent } from '@/components/ui/card'

export const List = () => {
  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8'>
          <div className='mb-2 h-8 w-24 animate-pulse rounded bg-muted' />
          <div className='h-5 w-80 animate-pulse rounded bg-muted' />
        </div>

        <div className='mb-8'>
          <Card className='bg-card p-6 shadow-elevation-1'>
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <div className='h-10 w-full animate-pulse rounded-md bg-muted' />
                </div>
                <div className='h-10 w-20 animate-pulse rounded-md bg-muted' />
              </div>

              <div className='grid gap-3 md:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='h-10 animate-pulse rounded-md bg-muted' />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className='overflow-hidden bg-card shadow-elevation-1'>
              <div className='aspect-[4/3] animate-pulse bg-muted' />

              <CardContent className='space-y-3 p-4'>
                <div className='flex gap-2'>
                  <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
                  <div className='h-5 w-20 animate-pulse rounded-full bg-muted' />
                </div>

                <div className='space-y-2'>
                  <div className='h-6 w-full animate-pulse rounded bg-muted' />
                  <div className='h-6 w-3/4 animate-pulse rounded bg-muted' />
                </div>

                <div className='space-y-2'>
                  {[1, 2, 3].map((j) => (
                    <div key={j} className='h-4 w-full animate-pulse rounded bg-muted' />
                  ))}
                </div>

                <div className='flex justify-between border-t border-border pt-2'>
                  <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                  <div className='h-4 w-16 animate-pulse rounded bg-muted' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='mt-12'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='h-10 w-24 animate-pulse rounded bg-muted' />
            <div className='h-5 w-48 animate-pulse rounded bg-muted' />
            <div className='h-10 w-24 animate-pulse rounded bg-muted' />
          </div>
        </div>

        <div className='fixed bottom-6 right-6 z-50'>
          <Card className='bg-card/90 border-primary/20 shadow-elevation-3 backdrop-blur-sm'>
            <CardContent className='flex items-center gap-3 p-4'>
              <div className='size-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              <span className='text-sm font-medium text-foreground'>Cargando artículos...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
