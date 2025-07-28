'use client'

import { useQuery } from '@tanstack/react-query'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Link as LinkIcon, Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardContent, Card as ShCard } from '@/components/ui/card'
import { postgresUserApi } from '@/modules/user/api'
import { Button } from '@/src/components/ui/button'


interface Props {
  userProfile: any // Tipo específico del perfil de usuario
}

export function ArtistProfileContent({ userProfile }: Props) {
  const params = useParams()
  const userId = params.userId as string

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: false,
      loop: true,
      skipSnaps: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const {
    data: profileData,
    isError,
    isLoading,
  } = useQuery({
    enabled: !!userId,
    queryFn: () => postgresUserApi.getPublicProfile(userId),
    queryKey: ['publicProfile', userId],
    initialData: userProfile,
  })

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-surface'>
        <p className='text-muted-foreground'>Cargando perfil...</p>
      </div>
    )
  }

  if (isError || !profileData) {
    return (
      <ShCard className='w-full max-w-md border border-error-container bg-error-container p-6 text-center shadow-elevation-2'>
        <h2 className='text-2xl font-bold text-on-error'>Perfil no encontrado</h2>
        <p className='text-on-error/80'>El perfil solicitado no existe o no es público.</p>
      </ShCard>
    )
  }

  const hasProducts = profileData.products && profileData.products.length > 0

  return (
    <>
      <style jsx global>{`
        @keyframes glow-pulse {
          0%,
          100% {
            box-shadow:
              0 0 5px currentColor,
              0 0 10px currentColor,
              0 0 15px currentColor;
            opacity: 0.8;
          }
          50% {
            box-shadow:
              0 0 10px currentColor,
              0 0 20px currentColor,
              0 0 30px currentColor;
            opacity: 1;
          }
        }

        @keyframes glow-rotate {
          0% {
            box-shadow:
              0 0 5px currentColor,
              0 0 10px currentColor;
            transform: rotate(0deg);
          }
          100% {
            box-shadow:
              0 0 5px currentColor,
              0 0 10px currentColor;
            transform: rotate(360deg);
          }
        }

        .glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .glow-rotate {
          animation: glow-rotate 3s linear infinite;
        }
      `}</style>

      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        {/* Hero Section */}
        <div className='relative overflow-hidden'>
          {/* Background Image */}
          {profileData.profile?.backgroundImageUrl && (
            <div className='absolute inset-0'>
              <img
                alt='Background'
                className='h-full w-full object-cover'
                src={profileData.profile.backgroundImageUrl}
              />
              <div className='absolute inset-0 bg-black/40' />
            </div>
          )}

          {/* Content */}
          <div className='relative z-10 flex min-h-[60vh] items-center justify-center px-4 py-16'>
            <div className='text-center text-white'>
              <div className='mb-8'>
                <Avatar className='mx-auto size-32 border-4 border-white/20 shadow-2xl'>
                  <AvatarImage
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    src={profileData.profile?.avatarUrl}
                  />
                  <AvatarFallback className='text-2xl font-bold'>
                    {profileData.firstName.charAt(0)}
                    {profileData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h1 className='mb-4 text-4xl font-bold md:text-6xl'>
                {profileData.firstName} {profileData.lastName}
              </h1>

              {profileData.profile?.occupation && (
                <p className='mb-8 text-xl text-white/90 md:text-2xl'>
                  {profileData.profile.occupation}
                </p>
              )}

              {/* Contact Button */}
              <Button
                asChild
                className='bg-white/20 text-white backdrop-blur-md hover:bg-white/30'
                size='lg'
                variant='outline'
              >
                <Link href={`mailto:${profileData.email}`}>
                  <Mail className='mr-2 size-4' />
                  Contactar
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Links Section */}
        {profileData.links && profileData.links.length > 0 && (
          <section className='py-16'>
            <div className='container mx-auto px-4'>
              <h2 className='mb-8 text-center text-3xl font-bold text-gray-800 dark:text-white'>
                Enlaces
              </h2>

              <div className='mx-auto max-w-2xl'>
                <div className='grid gap-4'>
                  {profileData.links.map((link: any) => {
                    return (
                      <ShCard
                        key={link.id}
                        className='group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800'
                      >
                        <CardContent className='p-0'>
                          <a
                            className='flex items-center p-6 transition-all duration-300 hover:scale-[1.02]'
                            href={link.url}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {/* Platform Icon */}
                            <div className='mr-4 flex size-12 items-center justify-center rounded-lg bg-blue-500 text-white'>
                              <LinkIcon className='size-6' />
                            </div>

                            {/* Link Info */}
                            <div className='flex-1'>
                              <h3 className='font-semibold text-gray-900 dark:text-white'>
                                {link.platform || 'Enlace'}
                              </h3>
                              {link.url && (
                                <p className='text-sm text-gray-600 dark:text-gray-400'>
                                  {link.url}
                                </p>
                              )}
                            </div>

                            {/* External Link Icon */}
                            <LinkIcon className='size-5 text-gray-400 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300' />
                          </a>
                        </CardContent>
                      </ShCard>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        {hasProducts && (
          <section className='bg-gray-50 py-16 dark:bg-gray-900'>
            <div className='container mx-auto px-4'>
              <h2 className='mb-8 text-center text-3xl font-bold text-gray-800 dark:text-white'>
                Obras Disponibles
              </h2>

              <div className='overflow-hidden' ref={emblaRef}>
                <div className='flex'>
                  {profileData.products.map((product: any) => (
                    <div key={product.id} className='min-w-0 flex-[0_0_300px] px-2'>
                      <ShCard className='h-full overflow-hidden'>
                        <div className='relative aspect-square'>
                          <img
                            alt={product.title}
                            className='h-full w-full object-cover'
                            src={product.featuredImage?.url || '/placeholder-product.jpg'}
                          />
                        </div>
                        <CardContent className='p-4'>
                          <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                            {product.title}
                          </h3>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {product.description}
                          </p>
                        </CardContent>
                      </ShCard>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Navigation */}
              <div className='mt-8 flex justify-center space-x-4'>
                <Button
                  onClick={scrollPrev}
                  size='sm'
                  variant='outline'
                >
                  <ChevronLeft className='size-4' />
                </Button>
                <Button
                  onClick={scrollNext}
                  size='sm'
                  variant='outline'
                >
                  <ChevronRight className='size-4' />
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
} 