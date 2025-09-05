import { Users } from 'lucide-react'

import { Landing } from '@/components/Landing'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/src/config/routes'

const ArtistSkeleton = () => (
  <Card className='bg-card shadow-elevation-1'>
    <div className='h-28 animate-pulse bg-muted' />
    <div className='relative -mt-12 flex justify-center'>
      <div className='size-24 animate-pulse rounded-full border-4 border-background bg-muted' />
    </div>
    <CardContent className='space-y-3 px-6 pb-6 pt-4 text-center'>
      <div className='mx-auto h-6 w-32 animate-pulse rounded bg-muted' />
      <div className='mx-auto h-4 w-24 animate-pulse rounded bg-muted' />
    </CardContent>
  </Card>
)

export function ArtistsLoader() {
  return (
    <Landing.Section
      icon={Users}
      title='Artistas Destacados'
      subtitle='Conoce el talento excepcional de nuestra comunidad de artistas emergentes y consagrados'
      actionText='Ver Todos los Artistas'
      actionHref={ROUTES.PUBLIC.ARTISTS.PATH}
      wrapperElement='section'
    >
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <ArtistSkeleton />
          </div>
        ))}
      </div>
    </Landing.Section>
  )
}
