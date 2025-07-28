/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

interface ArtistProps {
  artist: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    profile?: {
      avatarUrl?: string
      occupation?: string
      backgroundImageUrl?: string
    }
  }
}

export const Artist: React.FC<ArtistProps> = ({ artist }) => {

  const artistName =
    artist.firstName || artist.lastName
      ? `${artist.firstName} ${artist.lastName}`.trim()
      : artist.email

  return (
    <Card className='to-card/80 group relative overflow-hidden border-0 bg-gradient-to-br from-card shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl'>
      <Link
        href={replaceRouteParams(ROUTES.PUBLIC.PROFILE_DETAIL.PATH, { userId: artist.id })}
        className='block focus:outline-none'
        aria-label={`Ver perfil de ${artistName}`}
      >
        {/* Header con background image o gradiente */}
        <div className='relative h-28 overflow-hidden'>
          {artist.profile?.backgroundImageUrl ? (
            <>
              <img
                src={artist.profile.backgroundImageUrl}
                alt="Background"
                className='size-full object-cover transition-transform duration-700 group-hover:scale-110'
                loading='lazy'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent' />
            </>
          ) : (
            <div className='from-primary/20 via-primary/10 to-accent/20 size-full bg-gradient-to-br' />
          )}
        </div>
        
        {/* Avatar flotante - fuera del header */}
        <div className='relative -mt-12 flex justify-center'>
          <div className='relative'>
            <div className='size-24 overflow-hidden rounded-full border-4 border-background bg-background shadow-xl transition-transform duration-300 group-hover:scale-110'>
              {artist.profile?.avatarUrl ? (
                <img
                  src={artist.profile.avatarUrl}
                  alt={artistName}
                  className='size-full object-cover'
                  loading='lazy'
                  style={{
                    viewTransitionName: `artist-avatar-${artist.id}`,
                  }}
                />
              ) : (
                <div className='flex size-full items-center justify-center bg-muted'>
                  <Logo className='size-8' />
                </div>
              )}
            </div>
            
          </div>
        </div>

        <CardContent className='px-6 pb-6 pt-4 text-center'>
          {/* Nombre del artista */}
          <div className='mb-3'>
            <h3 className='text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary'>
              {artistName}
            </h3>
            
            {/* Ocupación */}
            {artist.profile?.occupation && (
              <p className='mt-1 text-sm text-muted-foreground'>
                {artist.profile.occupation}
              </p>
            )}
          </div>
        </CardContent>

        {/* Overlay de hover */}
        <div className='from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        
      </Link>
    </Card>
  )
}