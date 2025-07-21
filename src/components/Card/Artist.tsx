/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

interface ArtistProps {
  artist: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profile?: {
      avatarUrl?: string;
      bio?: string;
    };
  };
}

export const Artist: React.FC<ArtistProps> = ({ artist }) => {
  console.log('Artist component rendered with artist:', artist)
  const artistName =
    artist.firstName || artist.lastName
      ? `${artist.firstName} ${artist.lastName}`.trim()
      : artist.email
  return (
    <Card
      className='focus-within:ring-primary/20 group relative overflow-hidden border bg-card shadow-elevation-1 transition-all duration-300 focus-within:shadow-elevation-4 focus-within:ring-2 hover:shadow-elevation-3'
      style={{
        viewTransitionName: `artist-image-${artist.id}`,
      }}
    >
      <Link
        href={replaceRouteParams(ROUTES.PUBLIC.PROFILE_DETAIL.PATH, { userId: artist.id })}
        className='block focus:outline-none'
        aria-label={`Ver detalles de ${artistName}`}
      >
        <div className='relative aspect-square overflow-hidden bg-muted'>
          {artist.profile?.avatarUrl ? (
            <>
              <img
                src={artist.profile?.avatarUrl}
                alt={artistName ?? 'artist-profile'}
                className='size-full object-cover transition-all duration-500 group-focus-within:scale-105 group-hover:scale-110'
                loading='lazy'
                style={{
                  viewTransitionName: `artist-image-${artist.id}`,
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </>
          ) : (
            <div className='group-hover:bg-muted/80 flex size-full items-center justify-center bg-muted transition-colors duration-300'>
              <Logo />
            </div>
          )}

          <div className='absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0'>
            <div className='border-t border-border bg-card/90 p-3 backdrop-blur-sm'>
              <p className='text-center text-xs text-muted-foreground'>Ver perfil del artista</p>
            </div>
          </div>
        </div>
      </Link>

      <CardContent className='space-y-4 bg-card p-4'>
        <div className='space-y-2'>
          <div className='space-y-1'>
            <Link
              href={replaceRouteParams(ROUTES.PUBLIC.PROFILE_DETAIL.PATH, {
                userId: artist.id,
              })}
            >
              <h3 className='line-clamp-2 font-medium leading-tight text-foreground transition-colors duration-200 hover:text-primary focus:text-primary focus:outline-none'>
                {artistName}
              </h3>
            </Link>
          </div>

        
        </div>
      </CardContent>
    </Card>
  )
}
