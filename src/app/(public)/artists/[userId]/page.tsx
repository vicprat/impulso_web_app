import { Mail } from 'lucide-react'
import { notFound } from 'next/navigation'

import { ArtistStructuredData } from '@/components/StructuredData'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getPublicProfile } from '@/lib/landing-data'
import { generateArtistMetadata } from '@/lib/metadata'
import { Carrousel } from '@/src/components/Carrousel'

import { List } from '../components/List'

import type { Metadata } from 'next'

interface Props {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const userProfile = await getPublicProfile(userId)

  if (!userProfile) {
    return {
      description: 'El artista que buscas no está disponible en este momento.',
      title: 'Artista no encontrado',
    }
  }

  return generateArtistMetadata({
    firstName: userProfile.firstName ?? '',
    lastName: userProfile.lastName ?? '',
    profile: {
      avatarUrl: userProfile.profile?.avatarUrl ?? undefined,
      occupation: userProfile.profile?.occupation ?? undefined,
    },
  })
}

export default async function Page({ params }: Props) {
  const { userId } = await params

  const userProfile = await getPublicProfile(userId)

  if (!userProfile) {
    notFound()
  }

  const hasProducts = userProfile.products && userProfile.products.length > 0
  const fullName = `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim()
  const initials = `${userProfile.firstName?.charAt(0).toUpperCase() ?? ''}${userProfile.lastName?.charAt(0).toUpperCase() ?? ''}`
  const hasBioOrDescription = userProfile.profile?.bio ?? userProfile.profile?.description
  const hasLinks = userProfile.links && userProfile.links.length > 0

  const sortedLinks = userProfile.links?.sort((a, b) => a.order - b.order) || []

  return (
    <div className='min-h-screen'>
      <ArtistStructuredData
        artist={{
          email: userProfile.email,
          firstName: userProfile.firstName ?? '',
          lastName: userProfile.lastName ?? '',
          products: userProfile.products?.map((product) => ({
            description: product.description,
            id: product.id,
            images: product.images.map((img) => img.url),
            price: parseFloat(product.priceRange.minVariantPrice.amount),
            title: product.title,
          })),
          profile: {
            avatarUrl: userProfile.profile?.avatarUrl ?? undefined,
            bio: userProfile.profile?.bio ?? undefined,
            occupation: userProfile.profile?.occupation ?? undefined,
          },
        }}
      />
      <div className='relative'>
        <div className='relative h-64 w-full overflow-hidden md:h-80 lg:h-[32rem]'>
          {userProfile.profile?.backgroundImageUrl ? (
            <div className='relative size-full overflow-hidden'>
              <img
                src={userProfile.profile.backgroundImageUrl}
                alt={`Imagen de fondo de ${fullName}`}
                className='size-full object-cover object-center backdrop-blur-sm'
                loading='eager'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent lg:from-slate-900/20' />
            </div>
          ) : (
            <div className='size-full bg-gradient-to-br from-primary via-primary-container to-secondary-container'></div>
          )}
        </div>

        <div className='relative -mt-20 px-4 sm:px-6 lg:-mt-24 lg:px-8 xl:px-12 2xl:px-16'>
          <div className='mx-auto max-w-7xl xl:max-w-none'>
            <div className='hidden lg:block'>
              <div className='flex items-start space-x-8 xl:space-x-12 2xl:space-x-16'>
                <div className='shrink-0'>
                  <Avatar className='ring-surface/20 size-32 border-4 border-surface shadow-elevation-4 ring-4 xl:size-40 2xl:size-48'>
                    {userProfile.profile?.avatarUrl ? (
                      <AvatarImage
                        src={userProfile.profile.avatarUrl}
                        alt={`Avatar de ${fullName}`}
                        className='object-cover'
                      />
                    ) : (
                      <AvatarFallback className='bg-gradient-to-br from-primary-container to-secondary-container text-4xl font-bold text-on-primary-container xl:text-5xl 2xl:text-6xl'>
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div className='max-w-2xl flex-1 xl:max-w-3xl 2xl:max-w-4xl'>
                  <div className='rounded-3xl bg-surface-container p-6 xl:p-8 2xl:p-10'>
                    <h1 className='text-3xl font-bold text-on-surface xl:text-4xl 2xl:text-5xl'>
                      {fullName}
                    </h1>

                    {userProfile.artist?.name && (
                      <p className='mt-2 text-base font-medium text-primary xl:text-lg 2xl:text-xl'>
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

            <div className='block lg:hidden'>
              <div className='text-center'>
                <Avatar className='ring-surface/20 mx-auto size-24 border-4 border-surface shadow-elevation-4 ring-4 sm:size-32'>
                  {userProfile.profile?.avatarUrl ? (
                    <AvatarImage
                      src={userProfile.profile.avatarUrl}
                      alt={`Avatar de ${fullName}`}
                      className='object-cover'
                    />
                  ) : (
                    <AvatarFallback className='bg-gradient-to-br from-primary-container to-secondary-container text-3xl font-bold text-on-primary-container sm:text-4xl'>
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className='mt-6 rounded-3xl p-6 sm:p-8'>
                  <h1 className='text-3xl font-bold text-on-surface sm:text-4xl'>{fullName}</h1>

                  {userProfile.artist?.name && (
                    <p className='mt-3 font-medium text-primary sm:text-lg'>
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

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12 xl:max-w-none xl:px-12 2xl:px-16'>
        <div className='grid gap-8 lg:grid-cols-3 lg:gap-10 xl:gap-12 2xl:gap-16'>
          <div className='lg:col-span-2'>
            {hasBioOrDescription && (
              <div className='rounded-3xl p-6 lg:p-8 xl:p-10 2xl:p-12'>
                <h2 className='mb-6 text-2xl font-bold text-on-surface lg:text-3xl xl:text-4xl'>
                  Sobre mí
                </h2>

                {userProfile.profile?.description && (
                  <div
                    className='prose prose-lg mt-4 max-w-none dark:prose-invert xl:prose-xl 2xl:prose-2xl [&>*]:text-on-surface-variant [&_h1]:text-on-surface [&_h2]:text-on-surface [&_h3]:text-on-surface [&_strong]:text-on-surface'
                    dangerouslySetInnerHTML={{ __html: userProfile.profile.description }}
                  />
                )}

                {userProfile.profile?.bio && (
                  <div
                    className='prose prose-lg max-w-none dark:prose-invert xl:prose-xl 2xl:prose-2xl [&>*]:text-on-surface-variant [&_h1]:text-on-surface [&_h2]:text-on-surface [&_h3]:text-on-surface [&_strong]:text-on-surface'
                    dangerouslySetInnerHTML={{ __html: userProfile.profile.bio }}
                  />
                )}
              </div>
            )}
          </div>

          {hasLinks && (
            <div className='lg:col-span-1'>
              <div className='sticky top-8'>
                <div className='rounded-3xl p-6 xl:p-8 2xl:p-10'>
                  <h2 className='mb-6 text-xl font-bold text-on-surface xl:text-2xl 2xl:text-3xl'>
                    Enlaces
                  </h2>
                  <List links={sortedLinks} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasProducts && (
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12 xl:max-w-none xl:px-12 2xl:px-16'>
          <Carrousel.Products
            products={userProfile.products ?? []}
            title='Productos destacados'
            subtitle='Descubre mis trabajos más recientes'
          />
        </div>
      )}
    </div>
  )
}
