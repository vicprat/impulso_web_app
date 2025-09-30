'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

import { Artist } from '@/components/Card/Artist'
import { fadeIn, slideUp, staggerContainer } from '@/src/helpers/animations'
import { type PublicArtist } from '@/src/modules/user/types'

import { ArtistTypeFilter } from './ArtistTypeFilter'

interface Props {
  artists: PublicArtist[]
}

const mapPublicArtistToArtist = (publicArtist: PublicArtist) => {
  return {
    email: publicArtist.email,
    firstName: publicArtist.firstName,
    id: publicArtist.id,
    lastName: publicArtist.lastName,
    profile: {
      avatarUrl: publicArtist.profile?.avatarUrl ?? '',
      backgroundImageUrl: publicArtist.profile?.backgroundImageUrl ?? '',
      occupation: publicArtist.profile?.occupation ?? '',
    },
  }
}

export const Grid: React.FC<Props> = ({ artists }) => {
  return (
    <main className='container mx-auto px-4 py-8'>
      <motion.div
        variants={slideUp}
        initial='initial'
        whileInView='animate'
        viewport={{ once: true }}
        className='mb-12 text-center'
      >
        <h1 className='mb-4 text-4xl font-bold text-foreground'>Nuestros Artistas</h1>
        <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
          Conoce el talento excepcional de nuestra comunidad creativa
        </p>
        <div className='mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
          <div className='inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-primary'>
            <Users className='size-4' />
            <span className='text-sm font-medium'>{artists.length} artistas</span>
          </div>
          <ArtistTypeFilter />
        </div>
      </motion.div>

      <motion.div
        className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        variants={staggerContainer}
        initial='initial'
        whileInView='animate'
        viewport={{ once: true }}
      >
        {artists.map((publicArtist: PublicArtist) => (
          <Artist key={publicArtist.id} artist={mapPublicArtistToArtist(publicArtist)} />
        ))}
      </motion.div>

      {artists.length === 0 && (
        <motion.div
          className='py-16 text-center'
          variants={fadeIn}
          initial='initial'
          whileInView='animate'
          viewport={{ once: true }}
        >
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted'>
            <Users className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-xl font-semibold text-foreground'>
            No hay artistas disponibles
          </h3>
          <p className='text-muted-foreground'>
            En este momento no hay artistas disponibles. Vuelve pronto para descubrir nuevo talento.
          </p>
        </motion.div>
      )}
    </main>
  )
}
