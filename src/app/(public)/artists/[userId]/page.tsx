import type { Metadata } from 'next'
import { notFound } from 'next/navigation'


import { generateArtistMetadata } from '@/lib/metadata'
import { postgresUserApi } from '@/modules/user/api'
import { ArtistProfileContent } from '@/src/components/ArtistProfileContent'

interface Props {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  
  try {
    const userProfile = await postgresUserApi.getPublicProfile(userId)
    
    if (!userProfile) {
      return {
        title: 'Artista no encontrado | Impulso Galería',
        description: 'El perfil del artista solicitado no está disponible.',
      }
    }

    return generateArtistMetadata({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      profile: {
        occupation: userProfile.profile?.occupation,
        avatarUrl: userProfile.profile?.avatarUrl,
      }
    })
  } catch (error) {
    return {
      title: 'Artista no encontrado | Impulso Galería',
      description: 'El perfil del artista solicitado no está disponible.',
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
