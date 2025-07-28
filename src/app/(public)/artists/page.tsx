'use client'

import { motion } from 'framer-motion';

import { Card } from '@/components/Card';
import { usePublicArtists } from '@/src/modules/user/hooks/management';
import { type PublicArtist } from '@/src/modules/user/types';

const fadeIn = {
  animate: { opacity: 1 },
  initial: { opacity: 0 },
  transition: { duration: 0.5 },
}

const slideUp = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 50 },
  transition: { duration: 0.7, ease: 'easeInOut' },
}

const mapPublicArtistToArtist = (publicArtist: PublicArtist) => {
  return {
    email: publicArtist.email,
    firstName: publicArtist.firstName,
    id: publicArtist.id,
    lastName: publicArtist.lastName,
    profile: {
      avatarUrl: publicArtist.profile?.avatarUrl || undefined,
      backgroundImageUrl: publicArtist.profile?.backgroundImageUrl || undefined,
      occupation: publicArtist.profile?.occupation || undefined,
    }
  }
}

export default function Page() {
  const { data: artists, isError, isLoading } = usePublicArtists()

  console.log(artists)

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Card.Loader />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='mb-2 text-destructive'>Error al cargar los artistas</p>
          <p className='text-sm text-muted-foreground'>Intenta recargar la página</p>
        </div>
      </div>
    )
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      <motion.h1
        variants={slideUp}
        initial='initial'
        whileInView='animate'
        viewport={{ once: true }}
        className='mb-12 text-center text-4xl font-bold text-foreground'
      >
        Nuestros Artistas
      </motion.h1>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
        {artists?.map((publicArtist: PublicArtist) => (
          <motion.div
            key={publicArtist.id}
            variants={fadeIn}
            initial='initial'
            whileInView='animate'
            viewport={{ amount: 0.3, once: true }}
          >
            <Card.Artist artist={mapPublicArtistToArtist(publicArtist)} />
          </motion.div>
        ))}
      </div>

      {artists && artists.length === 0 && (
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>No hay artistas disponibles en este momento.</p>
        </div>
      )}
    </main>
  )
}