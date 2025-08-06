/* eslint-disable @next/next/no-img-element */
'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Link as LinkIcon, Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { postgresUserApi } from '@/modules/user/api'
import { PLATFORMS } from '@/src/config/platforms'

import { ProductCarousel } from '@/src/components/ProductCarousel'
import type { Link as LinkType } from '@/types/user'

export const dynamic = 'force-dynamic'

export default function Page() {
  const params = useParams()
  const userId = params.userId as string

  const {
    data: userProfile,
    isError,
    isLoading,
  } = useQuery({
    enabled: !!userId,
    queryFn: () => postgresUserApi.getPublicProfile(userId),
    queryKey: [ 'publicProfile', userId ],
  })

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-surface'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
        </div>
      </div>
    )
  }

  if (isError || !userProfile) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-surface p-4'>
        <div className='w-full max-w-md glass-card rounded-3xl p-8 text-center'>
          <div className='mx-auto mb-6 h-16 w-16 rounded-full bg-error flex items-center justify-center'>
            <span className='text-2xl'></span>
          </div>
          <h2 className='text-2xl font-bold text-on-error-container mb-3'>Perfil no encontrado</h2>
          <p className='text-on-error-container/80'>El perfil solicitado no existe o no es público.</p>
        </div>
      </div>
    )
  }

  const hasProducts = userProfile.products && userProfile.products.length > 0

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

  // Función para obtener estilos específicos de cada plataforma
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
        glowColor: 'text-chart-1',
        iconBgClass: 'bg-chart-1',
        iconColorClass: 'text-on-primary',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
      instagram: {
        glowColor: 'text-chart-3',
        iconBgClass: 'bg-gradient-to-r from-chart-2 via-chart-3 to-warning',
        iconColorClass: 'text-on-primary',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
      linkedin: {
        glowColor: 'text-chart-1',
        iconBgClass: 'bg-chart-1',
        iconColorClass: 'text-on-primary',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
      github: {
        glowColor: 'text-on-surface-variant',
        iconBgClass: 'bg-surface-container-highest',
        iconColorClass: 'text-on-surface',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
      twitter: {
        glowColor: 'text-on-surface-variant',
        iconBgClass: 'bg-surface-container-highest',
        iconColorClass: 'text-on-surface',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
      youtube: {
        glowColor: 'text-error',
        iconBgClass: 'bg-error',
        iconColorClass: 'text-on-error',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
      website: {
        glowColor: 'text-on-surface-variant',
        iconBgClass: 'bg-surface-container-high',
        iconColorClass: 'text-on-surface',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
      // Agrega más plataformas según necesites...
      custom: {
        glowColor: 'text-on-surface-variant',
        iconBgClass: 'bg-surface-container-high',
        iconColorClass: 'text-on-surface',
        linkClasses:
          'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
      },
    }
    return styles[ platformId.toLowerCase() ] || styles.custom
  }

  return (
    <>
      <style jsx global>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
            opacity: 0.8;
          }
          50% {
            box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
            opacity: 1;
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
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: exclude;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: glow-pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        .glass-card {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background: hsl(var(--surface-container) / 0.8);
          border: 1px solid hsl(var(--outline-variant) / 0.3);
          box-shadow: var(--elevation-2);
        }

        .glass-hero {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: hsl(var(--surface-container) / 0.9);
          border: 1px solid hsl(var(--outline-variant) / 0.4);
          box-shadow: var(--elevation-3);
        }

        .glass-sidebar {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          background: hsl(var(--surface-container-low) / 0.85);
          border: 1px solid hsl(var(--outline-variant) / 0.2);
          box-shadow: var(--elevation-1);
        }
      `}</style>

      <div className='min-h-screen bg-surface'>
        {/* Hero Section - Mejorado */}
        <div className='relative'>
          <div className='relative h-64 w-full md:h-80 lg:h-[32rem]'>
            {userProfile.profile?.backgroundImageUrl ? (
              <img
                src={userProfile.profile.backgroundImageUrl}
                alt='Background'
                className='size-full object-cover object-top'
                style={{ objectPosition: 'center top' }}
              />
            ) : (
              <div className='size-full bg-gradient-to-br from-primary via-primary-container to-secondary-container'></div>
            )}

            {/* Subtle overlay only at the bottom for text readability */}
            <div className='absolute inset-0 bg-gradient-to-t from-surface/30 via-transparent to-transparent lg:from-surface/20'></div>
          </div>

          {/* Profile Content - Layout híbrido mejorado */}
          <div className='relative -mt-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 lg:-mt-24'>
            <div className='mx-auto max-w-7xl xl:max-w-none 2xl:max-w-8xl'>
              {/* Desktop Layout - Mejorado */}
              <div className='hidden lg:block'>
                <div className='flex items-start space-x-8 xl:space-x-12 2xl:space-x-16'>
                  {/* Avatar */}
                  <div className='flex-shrink-0'>
                    <Avatar className='size-32 border-4 border-surface shadow-elevation-4 xl:size-40 2xl:size-48'>
                      {userProfile.profile?.avatarUrl ? (
                        <AvatarImage src={userProfile.profile.avatarUrl} alt='Avatar' />
                      ) : (
                        <AvatarFallback className='text-4xl font-bold xl:text-5xl 2xl:text-6xl bg-primary-container text-on-primary-container'>
                          {userProfile.firstName.charAt(0).toUpperCase()}{' '}
                          {userProfile.lastName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>

                  {/* Profile Info - Expandido para usar más espacio */}
                  <div className='flex-1 max-w-2xl xl:max-w-3xl 2xl:max-w-4xl'>
                    <div className='bg-surface-container rounded-3xl p-6 xl:p-8 2xl:p-10'>
                      <h1 className='text-3xl font-bold text-on-surface xl:text-4xl 2xl:text-5xl'>
                        {userProfile.firstName} {userProfile.lastName}
                      </h1>

                      {userProfile.artist?.name && (
                        <p className='mt-2 text-base text-primary font-medium xl:text-lg 2xl:text-xl'>
                          Artista: {userProfile.artist.name}
                        </p>
                      )}

                      {userProfile.profile?.occupation && (
                        <p className='mt-2 text-lg text-on-surface-variant xl:text-xl 2xl:text-2xl'>
                          {userProfile.profile.occupation}
                        </p>
                      )}

                      <div className='mt-4 flex items-center text-on-surface-variant'>
                        <Mail className='mr-2 size-4 xl:size-5' />
                        <span className='text-sm xl:text-base 2xl:text-lg'>{userProfile.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Layout */}
              <div className='block lg:hidden'>
                <div className='text-center'>
                  <Avatar className='mx-auto size-24 border-4 border-surface shadow-elevation-4 sm:size-32'>
                    {userProfile.profile?.avatarUrl ? (
                      <AvatarImage src={userProfile.profile.avatarUrl} alt='Avatar' />
                    ) : (
                      <AvatarFallback className='text-3xl font-bold sm:text-4xl bg-primary-container text-on-primary-container'>
                        {userProfile.firstName.charAt(0).toUpperCase()}{' '}
                        {userProfile.lastName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className='mt-6 glass-hero rounded-3xl p-6 sm:p-8'>
                    <h1 className='text-3xl font-bold text-on-surface sm:text-4xl'>
                      {userProfile.firstName} {userProfile.lastName}
                    </h1>

                    {userProfile.artist?.name && (
                      <p className='mt-3 text-primary font-medium sm:text-lg'>
                        Artista: {userProfile.artist.name}
                      </p>
                    )}

                    {userProfile.profile?.occupation && (
                      <p className='mt-3 text-lg text-on-surface-variant sm:text-xl'>
                        {userProfile.profile.occupation}
                      </p>
                    )}

                    <div className='mt-4 flex items-center justify-center text-on-surface-variant'>
                      <Mail className='mr-2 size-4' />
                      <span className='text-sm sm:text-base'>{userProfile.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='mx-auto max-w-7xl xl:max-w-none 2xl:max-w-8xl px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 lg:py-12'>
          <div className='grid gap-8 lg:grid-cols-3 lg:gap-10 xl:gap-12 2xl:gap-16'>
            {/* Left Column - Bio & Description */}
            <div className='lg:col-span-2'>
              {(userProfile.profile?.bio || userProfile.profile?.description) && (
                <div className='glass-card rounded-3xl p-6 lg:p-8 xl:p-10 2xl:p-12'>
                  <h2 className='mb-6 text-2xl font-bold text-on-surface lg:text-3xl xl:text-4xl'>
                    Sobre mí
                  </h2>

                  {userProfile.profile?.description && (
                    <div
                      className='prose prose-lg mt-4 max-w-none dark:prose-invert xl:prose-xl 2xl:prose-2xl [&>*]:text-on-surface-variant [&_strong]:text-on-surface [&_h1]:text-on-surface [&_h2]:text-on-surface [&_h3]:text-on-surface'
                      dangerouslySetInnerHTML={{ __html: userProfile.profile.description }}
                    />
                  )}

                  {userProfile.profile?.bio && (
                    <div
                      className='prose prose-lg max-w-none dark:prose-invert xl:prose-xl 2xl:prose-2xl [&>*]:text-on-surface-variant [&_strong]:text-on-surface [&_h1]:text-on-surface [&_h2]:text-on-surface [&_h3]:text-on-surface'
                      dangerouslySetInnerHTML={{ __html: userProfile.profile.bio }}
                    />
                  )}


                </div>
              )}
            </div>

            {/* Right Column - Links */}
            {userProfile.links && userProfile.links.length > 0 && (
              <div className='lg:col-span-1'>
                <div className='sticky top-8'>
                  <div className='glass-sidebar rounded-3xl p-6 xl:p-8 2xl:p-10'>
                    <h2 className='mb-6 text-xl font-bold text-on-surface xl:text-2xl 2xl:text-3xl'>
                      Enlaces
                    </h2>

                    <div className='space-y-3 xl:space-y-4 2xl:space-y-5'>
                      {userProfile.links
                        .sort((a: LinkType, b: LinkType) => a.order - b.order)
                        .map((link: LinkType) => {
                          const platformData = getPlatformData(link.platform)
                          const { glowColor, iconBgClass, iconColorClass, linkClasses } =
                            getPlatformStyles(link.platform)

                          return (
                            <Link
                              key={link.id}
                              href={link.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className={`group flex items-center rounded-2xl p-3 xl:p-4 2xl:p-5 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${linkClasses}`}
                            >
                              <div
                                className={`mr-3 xl:mr-4 2xl:mr-5 flex items-center justify-center rounded-xl p-2 xl:p-3 2xl:p-4 transition-all duration-300 ${iconColorClass} ${iconBgClass}`}
                              >
                                {platformData.icon}
                              </div>

                              <span className='flex-1 font-medium text-on-surface transition-colors duration-300 xl:text-lg 2xl:text-xl'>
                                {platformData.name}
                              </span>

                              <ChevronRight className='size-4 xl:size-5 2xl:size-6 text-on-surface-variant transition-all duration-300 group-hover:translate-x-1 group-hover:text-on-surface' />
                            </Link>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      {hasProducts && (
        <div className='mx-auto max-w-7xl xl:max-w-none 2xl:max-w-8xl px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 lg:py-12'>

          <ProductCarousel
            products={userProfile.products}
            title="Productos destacados"
            subtitle="Descubre mis trabajos más recientes"
            autoplay={true}
            scrollSpeed={1}
            stopOnInteraction={false}
          />
        </div>
      )}
    </>
  )
}