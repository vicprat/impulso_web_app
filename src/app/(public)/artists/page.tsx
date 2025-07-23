'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/src/config/routes'
import { usePublicArtists } from '@/src/modules/user/hooks/management'
import { type PublicArtist } from '@/src/modules/user/types'

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

export default function Page() {
  const { data: artists, isError, isLoading } = usePublicArtists()

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p>Cargando artistas...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p>Error al cargar los artistas.</p>
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
        className='mb-8 text-center text-4xl font-bold text-gray-800 dark:text-gray-200'
      >
        Nuestros Artistas
      </motion.h1>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {artists?.map((artist: PublicArtist) => (
          <motion.div
            key={artist.id}
            variants={fadeIn}
            initial='initial'
            whileInView='animate'
            viewport={{ amount: 0.3, once: true }}
            className='overflow-hidden rounded-lg bg-white shadow-md transition-transform duration-300 hover:scale-105 dark:bg-gray-800'
          >
            <div className='relative h-48 w-full'>
              <Image
                src={artist.profileImage || '/placeholder-artist.jpg'} 
                alt={artist.name || 'Artista'}
                fill
                className='object-cover'
              />
            </div>
            <div className='p-4'>
              <h2 className='mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200'>
                {artist.name}
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {artist.bio?.substring(0, 100)}... 
              </p>
              <Button asChild className='mt-4 w-full'>
                <Link href={ROUTES.PUBLIC.PROFILE_DETAIL.PATH.replace(':userId', artist.id)}>
                  Ver Perfil
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  )
}
