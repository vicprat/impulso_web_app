/* eslint-disable @next/next/no-img-element */
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
import { Card } from '@/src/components/Card'
import { Button } from '@/src/components/ui/button'
import { PLATFORMS } from '@/src/config/platforms'

import type { Link as LinkType } from '@/types/user'

export default function Page() {
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
    data: userProfile,
    isError,
    isLoading,
  } = useQuery({
    enabled: !!userId,
    queryFn: () => postgresUserApi.getPublicProfile(userId),
    queryKey: ['publicProfile', userId],
  })

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-surface'>
        <p className='text-muted-foreground'>Cargando perfil...</p>
      </div>
    )
  }

  if (isError || !userProfile) {
    return (
      <ShCard className='w-full max-w-md border border-error-container bg-error-container p-6 text-center shadow-elevation-2'>
        <h2 className='text-2xl font-bold text-on-error'>Perfil no encontrado</h2>
        <p className='text-on-error/80'>El perfil solicitado no existe o no es público.</p>
      </ShCard>
    )
  }

  const hasProducts = userProfile.products && userProfile.products.length > 0

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
          25% {
            box-shadow:
              2px 2px 8px currentColor,
              4px 4px 15px currentColor;
            transform: rotate(90deg);
          }
          50% {
            box-shadow:
              0 4px 10px currentColor,
              0 8px 20px currentColor;
            transform: rotate(180deg);
          }
          75% {
            box-shadow:
              -2px 2px 8px currentColor,
              -4px 4px 15px currentColor;
            transform: rotate(270deg);
          }
          100% {
            box-shadow:
              0 0 5px currentColor,
              0 0 10px currentColor;
            transform: rotate(360deg);
          }
        }

        .glow-border {
          position: relative;
          overflow: visible;
        }

        .glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(45deg, currentColor, transparent, currentColor);
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: exclude;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: glow-pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        .glow-border.rotating::before {
          animation: glow-rotate 3s linear infinite;
        }
      `}</style>

      <div className='container mx-auto min-h-screen bg-surface p-4 md:p-8'>
        <ShCard className='overflow-hidden border border-outline bg-card shadow-elevation-1'>
          <div className='relative h-64 w-full bg-gradient-to-r from-purple-500 to-indigo-600 md:h-80'>
            {userProfile.profile?.backgroundImageUrl && (
              <img
                src={userProfile.profile.backgroundImageUrl}
                alt='Background'
                className='size-full object-cover'
              />
            )}
            <div className='absolute -bottom-12 left-1/2 -translate-x-1/2 sm:-bottom-16 md:left-8 md:transform-none'>
              <Avatar className='size-24 border-4 border-surface shadow-lg sm:size-32'>
                {userProfile.profile?.avatarUrl ? (
                  <AvatarImage src={userProfile.profile.avatarUrl} alt='Avatar' />
                ) : (
                  <AvatarFallback className='text-3xl font-bold sm:text-5xl'>
                    {userProfile.firstName.charAt(0).toUpperCase()}{' '}
                    {userProfile.lastName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
          <CardContent className='p-4 pt-16 text-center sm:p-8 sm:pt-20 md:text-left'>
            <h1 className='text-3xl font-bold text-foreground sm:text-4xl'>
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            {userProfile.artist?.name && (
              <p className='sm:text-md mt-1 text-sm text-muted-foreground'>
                Artista: {userProfile.artist.name}
              </p>
            )}
            {userProfile.profile?.occupation && (
              <p className='mt-2 text-lg text-muted-foreground sm:text-xl'>
                {userProfile.profile.occupation}
              </p>
            )}
            <div className='mt-3 flex items-center justify-center text-muted-foreground sm:mt-4 md:justify-start'>
              <Mail className='mr-2 size-4 sm:size-5' />
              <span className='text-sm sm:text-base'>{userProfile.email}</span>
            </div>

            {userProfile.profile?.bio && (
              <div
                className='prose prose-sm prose-gray mx-auto mt-4 max-w-none dark:prose-invert sm:prose sm:mt-6 md:mx-0'
                dangerouslySetInnerHTML={{ __html: userProfile.profile.bio }}
              />
            )}

            {userProfile.profile?.description && (
              <div
                className='prose prose-sm prose-gray mx-auto mt-3 max-w-none dark:prose-invert sm:prose sm:mt-4 md:mx-0'
                dangerouslySetInnerHTML={{ __html: userProfile.profile.description }}
              />
            )}

            {userProfile.links && userProfile.links.length > 0 && (
              <div className='mt-8 sm:mt-12'>
                <h2 className='mb-6 text-center text-xl font-semibold text-gray-900 dark:text-gray-100 sm:mb-8 sm:text-2xl'>
                  Mis Enlaces
                </h2>
                <div className='mx-auto max-w-sm space-y-3 sm:max-w-md sm:space-y-4'>
                  {userProfile.links
                    .sort((a: LinkType, b: LinkType) => a.order - b.order)
                    .map((link: LinkType) => {
                      // Función helper para obtener los datos de la plataforma
                      const getPlatformData = (platformId: string) => {
                        const platform = PLATFORMS.find((p) => p.id === platformId.toLowerCase())
                        return (
                          platform || {
                            icon: <LinkIcon className='size-5' />,
                            id: 'custom',
                            name: platformId,
                          }
                        )
                      }

                      // Función para obtener estilos específicos de cada plataforma (multitema)
                      const getPlatformStyles = (platformId: string) => {
                        const styles: Record<
                          string,
                          {
                            linkClasses: string
                            iconColorClass: string
                            iconBgClass: string
                            glowColor: string
                          }
                        > = {
                          behance: {
                            glowColor: 'text-blue-500',
                            iconBgClass: 'bg-blue-600',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          custom: {
                            glowColor: 'text-gray-400',
                            iconBgClass: 'bg-gray-500',
                            iconColorClass: 'text-gray-900 dark:text-gray-100',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          discord: {
                            glowColor: 'text-indigo-500',
                            iconBgClass: 'bg-indigo-600',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          dribbble: {
                            glowColor: 'text-pink-500',
                            iconBgClass: 'bg-pink-500',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          facebook: {
                            glowColor: 'text-blue-500',
                            iconBgClass: 'bg-blue-600',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          github: {
                            glowColor: 'text-gray-500',
                            iconBgClass: 'bg-gray-800',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          instagram: {
                            glowColor: 'text-pink-500',
                            iconBgClass:
                              'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          linkedin: {
                            glowColor: 'text-blue-600',
                            iconBgClass: 'bg-blue-700',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          medium: {
                            glowColor: 'text-gray-500',
                            iconBgClass: 'bg-gray-800',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          patreon: {
                            glowColor: 'text-orange-500',
                            iconBgClass: 'bg-orange-500',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          pinterest: {
                            glowColor: 'text-red-500',
                            iconBgClass: 'bg-red-600',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          reddit: {
                            glowColor: 'text-orange-500',
                            iconBgClass: 'bg-orange-600',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          spotify: {
                            glowColor: 'text-green-500',
                            iconBgClass: 'bg-green-500',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          telegram: {
                            glowColor: 'text-blue-500',
                            iconBgClass: 'bg-blue-500',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          threads: {
                            glowColor: 'text-gray-500',
                            iconBgClass: 'bg-black',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          tiktok: {
                            glowColor: 'text-gray-500',
                            iconBgClass: 'bg-black',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          twitch: {
                            glowColor: 'text-purple-500',
                            iconBgClass: 'bg-purple-600',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          twitter: {
                            glowColor: 'text-gray-500',
                            iconBgClass: 'bg-gray-900',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          whatsapp: {
                            glowColor: 'text-green-500',
                            iconBgClass: 'bg-green-500',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                          youtube: {
                            glowColor: 'text-red-500',
                            iconBgClass: 'bg-red-600',
                            iconColorClass: 'text-white',
                            linkClasses:
                              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-md',
                          },
                        }
                        return styles[platformId.toLowerCase()] || styles.custom
                      }

                      // Función para obtener el color del focus ring específico de cada plataforma
                      const getFocusRingColor = (platformId: string) => {
                        return 'focus:ring-gray-400 dark:focus:ring-gray-500'
                      }

                      const platformData = getPlatformData(link.platform)
                      const { glowColor, iconBgClass, iconColorClass, linkClasses } =
                        getPlatformStyles(link.platform)
                      const focusRingColor = getFocusRingColor(link.platform)

                      return (
                        <Link
                          key={link.id}
                          href={link.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className={`glow-border group relative flex w-full items-center justify-between rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] dark:focus:ring-offset-gray-900 sm:p-5 ${linkClasses} ${focusRingColor} ${glowColor}`}
                        >
                          <div
                            className={`mr-4 flex items-center justify-center rounded-xl p-2 transition-all duration-300 ${iconColorClass} ${iconBgClass}`}
                          >
                            {platformData.icon}
                          </div>
                          <span className='font-semibold text-gray-900 transition-transform duration-300 group-hover:translate-x-1 dark:text-gray-100 sm:text-lg'>
                            {platformData.name}
                          </span>

                          {/* Flecha indicadora */}
                          <div className='text-gray-900 transition-all duration-300 group-hover:translate-x-1 dark:text-gray-100'>
                            <svg
                              className='size-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 5l7 7-7 7'
                              />
                            </svg>
                          </div>

                          {/* Efecto de brillo sutil */}
                          <div className='absolute inset-0 -skew-x-12 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100'></div>
                        </Link>
                      )
                    })}
                </div>
              </div>
            )}
          </CardContent>
        </ShCard>

        {hasProducts && (
          <div className='mt-16 lg:mt-24'>
            <div className='mb-8 flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-foreground sm:text-3xl'>
                  Productos relacionados
                </h2>
                <p className='mt-2 text-muted-foreground'>Descubre más obras similares</p>
              </div>
              <div className='hidden gap-2 sm:flex'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={scrollPrev}
                  className='size-10 border-outline hover:bg-surface-container-low'
                >
                  <ChevronLeft className='size-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={scrollNext}
                  className='size-10 border-outline hover:bg-surface-container-low'
                >
                  <ChevronRight className='size-4' />
                </Button>
              </div>
            </div>

            {/* Carrusel corregido */}
            <div className='embla overflow-hidden' ref={emblaRef}>
              <div className='embla__container flex'>
                {userProfile.products.map((product: any) => (
                  <div
                    key={product.id}
                    className='embla__slide mr-4 w-72 shrink-0 sm:w-80 md:mr-6 md:w-96'
                  >
                    <Card.Product product={product} />
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-6 flex justify-center gap-2 sm:hidden'>
              <Button
                variant='outline'
                size='sm'
                onClick={scrollPrev}
                className='border-outline hover:bg-surface-container-low'
              >
                <ChevronLeft className='mr-1 size-4' />
                Anterior
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={scrollNext}
                className='border-outline hover:bg-surface-container-low'
              >
                Siguiente
                <ChevronRight className='ml-1 size-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
