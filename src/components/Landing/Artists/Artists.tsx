import { Users } from 'lucide-react'

import { Card as ArtistCard } from '@/src/components/Card'
import { type PublicArtist } from '@/src/modules/user/types'

interface Props {
  data: PublicArtist[]
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

export const Artists: React.FC<Props> = ({ data }) => {
  return (
    <>


      {data.length > 0 && (
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {data.slice(0, 8).map((artist, index) => (
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

      {data.length === 0 && (
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
