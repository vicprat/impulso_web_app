import { Card, CardContent } from '@/components/ui/card'

export const Loader = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Card className='bg-card shadow-elevation-1' key={i}>
        <div className='h-28 animate-pulse bg-muted' />
        <div className='relative -mt-12 flex justify-center'>
          <div className='size-24 animate-pulse rounded-full border-4 border-background bg-muted' />
        </div>
        <CardContent className='space-y-3 px-6 pb-6 pt-4 text-center'>
          <div className='mx-auto h-6 w-32 animate-pulse rounded bg-muted' />
          <div className='mx-auto h-4 w-24 animate-pulse rounded bg-muted' />
        </CardContent>
      </Card>
    ))}
  </>
)
