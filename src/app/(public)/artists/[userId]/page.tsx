import { notFound } from 'next/navigation'


import { generateArtistMetadata } from '@/lib/metadata'
import { postgresUserApi } from '@/modules/user/api'
import { ArtistProfileContent } from '@/src/components/ArtistProfileContent'

import type { Metadata } from 'next'

interface Props {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  
  try {
    const userProfile = await postgresUserApi.getPublicProfile(userId)
    
    if (!userProfile) {
      return {
        description: 'El perfil del artista solicitado no está disponible.',
        title: 'Artista no encontrado | Impulso Galería',
      }
    }

    return generateArtistMetadata({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      profile: {
        avatarUrl: userProfile.profile?.avatarUrl,
        occupation: userProfile.profile?.occupation,
      }
    })
  } catch (error) {
    return {
      description: 'El perfil del artista solicitado no está disponible.',
      title: 'Artista no encontrado | Impulso Galería',
    }
  }
}

export default async function Page({ params }: Props) {
  const { userId } = await params
  
  try {
    const userProfile = await postgresUserApi.getPublicProfile(userId)
    
    if (!userProfile) {
      notFound()
    }

    return <ArtistProfileContent userProfile={userProfile} />
  } catch (error) {
    notFound()
  }
}
