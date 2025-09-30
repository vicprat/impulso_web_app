'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'
import React from 'react'

import { Card as ArtistCard } from '@/components/Card'
import { type PublicArtist } from '@/src/modules/user/types'

interface Props {
  artists: PublicArtist[]
  title: string
  subtitle?: string
  autoplay?: boolean
  scrollSpeed?: number
  stopOnInteraction?: boolean
}

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

export const Carousel: React.FC<Props> = ({
  autoplay = true,
  artists,
  scrollSpeed = 1,
  stopOnInteraction = false,
  subtitle,
  title,
}) => {
  const duplicatedArtists = [...artists, ...artists, ...artists]

  const [emblaRef] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: false,
      dragFree: true,
      loop: true,
      skipSnaps: false,
      slidesToScroll: 1,
    },
    autoplay
      ? [
          AutoScroll({
            direction: 'forward',
            playOnInit: true,
            speed: scrollSpeed,
            stopOnFocusIn: false,
            stopOnInteraction,
            stopOnMouseEnter: true,
          }),
        ]
      : []
  )

  if (artists.length === 0) {
    return null
  }

  return (
    <div className='overflow-hidden' ref={emblaRef}>
      <div className='flex gap-4 md:gap-6'>
        {duplicatedArtists.map((artist, index) => (
          <div key={`${artist.id}-${index}`} className='w-64 flex-none sm:w-72 md:w-80'>
            <ArtistCard.Artist artist={publicArtist(artist)} />
          </div>
        ))}
      </div>
    </div>
  )
}
