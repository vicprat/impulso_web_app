/* eslint-disable @next/next/no-img-element */
'use client'

import { User } from 'lucide-react'
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
  // Nuevas props para configurar fallbacks
  avatarFallback?: 'initials' | 'icon' | 'logo' | 'gradient'
  backgroundFallback?: 'dynamic' | 'minimal' | 'pattern' | 'solid'
}

// Utilidades
const generateColorFromString = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

const getInitials = (firstName?: string, lastName?: string, email?: string) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  if (lastName) {
    return lastName.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return 'U'
}

export const Artist: React.FC<ArtistProps> = ({ 
  artist, 
  avatarFallback = 'initials',
  backgroundFallback = 'dynamic'
}) => {
  const artistName =
    artist.firstName || artist.lastName
      ? `${artist.firstName} ${artist.lastName}`.trim()
      : artist.email

  const initials = getInitials(artist.firstName, artist.lastName, artist.email)
  const userColor = generateColorFromString(artist.id || artist.email)

  // Renderizar avatar fallback
  const renderAvatarFallback = () => {
    switch (avatarFallback) {
      case 'icon':
        return (
          <div 
            className='flex size-full items-center justify-center'
            style={{ backgroundColor: userColor }}
          >
            <User className='size-10 text-white' strokeWidth={1.5} />
          </div>
        )
      
      case 'logo':
        return (
          <div className='flex size-full items-center justify-center bg-muted'>
            <Logo className='size-8' />
          </div>
        )
      
      case 'gradient':
        return (
          <div className='flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white'>
            {initials}
          </div>
        )
      
      default: // 'initials'
        return (
          <div 
            className='flex size-full items-center justify-center text-lg font-semibold text-white'
            style={{ backgroundColor: userColor }}
          >
            {initials}
          </div>
        )
    }
  }

  // Renderizar background fallback
  const renderBackgroundFallback = () => {
    switch (backgroundFallback) {
      case 'minimal':
        return (
          <div className='from-muted/30 to-muted/10 size-full bg-gradient-to-br' />
        )
      
      case 'pattern':
        return (
          <div 
            className='relative size-full'
            style={{ backgroundColor: `${userColor}20` }}
          >
            <div 
              className='absolute inset-0 opacity-30'
              style={{
                backgroundImage: `radial-gradient(circle, ${userColor} 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            />
          </div>
        )
      
      case 'solid':
        return (
          <div 
            className='size-full'
            style={{ backgroundColor: `${userColor}15` }}
          />
        )
      
      default: // 'dynamic'
        return (
          <div 
            className='size-full bg-gradient-to-br opacity-60'
            style={{
              background: `linear-gradient(135deg, ${userColor}20, ${userColor}10, transparent)`
            }}
          />
        )
    }
  }

  return (
    <Card className='to-card/80 group relative overflow-hidden border-0 bg-gradient-to-br from-card shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl'>
      <Link
        href={replaceRouteParams(ROUTES.PUBLIC.PROFILE_DETAIL.PATH, { userId: artist.id })}
        className='block focus:outline-none'
        aria-label={`Ver perfil de ${artistName}`}
      >
        {/* Header con background */}
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
            renderBackgroundFallback()
          )}
        </div>
        
        {/* Avatar flotante */}
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
                renderAvatarFallback()
              )}
            </div>
          </div>
        </div>

        <CardContent className='px-6 pb-6 pt-4 text-center'>
          <div className='mb-3'>
            <h3 className='text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary'>
              {artistName}
            </h3>
            
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