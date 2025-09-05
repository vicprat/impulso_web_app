'use client'

import { Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Card as ArtistCard } from '@/src/components/Card'
import { type PublicArtist } from '@/src/modules/user/types'

interface ArtistsSectionProps {
  artists: PublicArtist[]
  isLoading?: boolean
}

export const ArtistSkeleton = () => (
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

const publicArtist = (publicArtist: PublicArtist) => {
  return {
    email: publicArtist.email,
    firstName: publicArtist.firstName,
    id: publicArtist.id,
    lastName: publicArtist.lastName,
    profile: {
      avatarUrl: publicArtist.profile?.avatarUrl ?? undefined,
      backgroundImageUrl: publicArtist.profile?.backgroundImageUrl ?? undefined,
      occupation: publicArtist.profile?.occupation ?? undefined,
    },
  }
}

export function ArtistsSection({ artists }: ArtistsSectionProps) {
  return (
    <>


      {artists.length > 0 && (
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {artists.slice(0, 8).map((artist, index) => (
            <div
              key={artist.id}
              className='animate-fade-in-up'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ArtistCard.Artist artist={publicArtist(artist)} />
            </div>
          ))}
        </div>
      )}

      {artists.length === 0 && (
        <div className='animate-fade-in-up py-16 text-center'>
          <div className='mx-auto mb-6 flex size-24 animate-scale-in items-center justify-center rounded-full bg-muted' style={{ animationDelay: '0.2s' }}>
            <Users className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 animate-fade-in-up text-xl font-semibold text-foreground' style={{ animationDelay: '0.3s' }}>
            Construyendo nuestra comunidad
          </h3>
          <p className='animate-fade-in-up text-muted-foreground' style={{ animationDelay: '0.4s' }}>
            Pronto podrás conocer a nuestros increíbles artistas
          </p>
        </div>
      )}
    </>
  )
}
