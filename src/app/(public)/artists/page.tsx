'use client'

import { motion } from 'framer-motion'
import { Sparkles, Users } from 'lucide-react'

import { Artist } from '@/components/Card/Artist'
import { Card, CardContent } from '@/components/ui/card'
import { usePublicArtists } from '@/src/modules/user/hooks/management'
import { type PublicArtist } from '@/src/modules/user/types'

// Skeleton específico para Artist Card
const ArtistSkeleton = ({ index }: { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <Card className='relative h-80 overflow-hidden border-0 bg-card shadow-elevation-1 transition-all duration-500 hover:shadow-elevation-2'>
        <div className='flex h-full flex-col'>
          {/* Header con background skeleton - Altura exacta h-28 */}
          <div className='relative h-28 shrink-0 overflow-hidden'>
            <div className='via-muted/80 size-full animate-pulse bg-gradient-to-br from-muted to-muted' />
            {/* Shimmer effect */}
            <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent'
              style={{
                animation: 'shimmer 2s infinite',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
              }} />
          </div>

          {/* Avatar flotante skeleton - Posición exacta -mt-12 */}
          <div className='relative -mt-12 flex shrink-0 justify-center'>
            <div className='relative'>
              <div className='size-24 animate-pulse overflow-hidden rounded-full border-4 border-background bg-muted shadow-elevation-2'>
                {/* Contenido del avatar skeleton */}
                <div className='to-muted/80 flex size-full items-center justify-center bg-gradient-to-br from-muted'>
                  <div className='bg-muted/60 size-8 animate-pulse rounded-full' />
                </div>
              </div>
              {/* Pulso sutil alrededor del avatar */}
              <div className='bg-primary/20 absolute inset-0 animate-ping rounded-full opacity-30'
                style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Contenido principal skeleton */}
          <CardContent className='flex flex-1 flex-col justify-center px-6 pb-6 pt-4 text-center'>
            <div className='mb-3'>
              {/* Nombre skeleton - altura mínima min-h-14 */}
              <div className='flex min-h-14 items-center justify-center'>
                <div className='space-y-2'>
                  <div className='mx-auto h-5 w-32 animate-pulse rounded bg-muted' />
                  <div className='mx-auto h-5 w-24 animate-pulse rounded bg-muted' />
                </div>
              </div>

              {/* Ocupación skeleton - altura mínima min-h-8 */}
              <div className='flex min-h-8 items-center justify-center'>
                <div className='bg-muted/60 h-4 w-20 animate-pulse rounded' />
              </div>
            </div>
          </CardContent>
        </div>

        {/* Overlay sutil */}
        <div className='to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent opacity-50' />
      </Card>
    </motion.div>
  )
}

// Componente de loading completo para la página
const ArtistsPageSkeleton = () => {
  return (
    <main className='container mx-auto px-4 py-8'>
      {/* Header skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='mb-12 text-center'
      >
        <div className='mx-auto mb-4 h-10 w-64 animate-pulse rounded bg-muted' />
        <div className='bg-muted/60 mx-auto h-5 w-96 animate-pulse rounded' />
      </motion.div>

      {/* Grid de artistas skeleton */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
        {Array.from({ length: 10 }).map((_, index) => (
          <ArtistSkeleton key={index} index={index} />
        ))}
      </div>

      {/* Floating loading indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className='fixed bottom-6 left-6 z-50'
      >
        <Card className='bg-card/90 border-primary/20 shadow-elevation-3 backdrop-blur-sm'>
          <CardContent className='flex items-center gap-3 p-4'>
            <div className='relative'>
              <Users className='size-5 animate-pulse text-primary' />
              <Sparkles className='text-primary/60 absolute -right-1 -top-1 size-3 animate-ping' />
            </div>
            <span className='text-sm font-medium text-foreground'>Cargando artistas...</span>
          </CardContent>
        </Card>
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  )
}

// Animaciones para el contenido real
const fadeIn = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 30 },
  transition: { duration: 0.6 },
}

const slideUp = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 50 },
  transition: { duration: 0.8, ease: 'easeOut' },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Función de mapeo
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


export const dynamic = 'force-dynamic'

export default function ArtistsPage() {
  const { data: artists, isError, isLoading } = usePublicArtists()

  // Estado de loading con skeleton específico
  if (isLoading) {
    return <ArtistsPageSkeleton />
  }

  // Estado de error
  if (isError) {
    return (
      <main className='container mx-auto px-4 py-8'>
        <div className='py-16 text-center'>
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-error-container'>
            <Users className='size-8 text-error' />
          </div>
          <h2 className='mb-2 text-xl font-semibold text-foreground'>
            Error al cargar artistas
          </h2>
          <p className='text-muted-foreground'>
            No pudimos cargar la información de los artistas. Por favor, intenta más tarde.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      {/* Header animado */}
      <motion.div
        variants={slideUp}
        initial='initial'
        whileInView='animate'
        viewport={{ once: true }}
        className='mb-12 text-center'
      >
        <h1 className='mb-4 text-4xl font-bold text-foreground'>
          Nuestros Artistas
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
          Conoce el talento excepcional de nuestra comunidad creativa
        </p>
        {artists && (
          <div className='mt-4 inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-primary'>
            <Users className='size-4' />
            <span className='text-sm font-medium'>{artists.length} artistas</span>
          </div>
        )}
      </motion.div>

      {/* Grid de artistas */}
      <motion.div
        className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        variants={staggerContainer}
        initial='initial'
        whileInView='animate'
        viewport={{ once: true }}
      >
        {artists?.map((publicArtist: PublicArtist, index: number) => (
          <Artist
            key={publicArtist.id}
            artist={mapPublicArtistToArtist(publicArtist)}
          />
        ))}
      </motion.div>

      {/* Empty state */}
      {artists && artists.length === 0 && (
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