/* eslint-disable @next/next/no-img-element */
'use client'

import { useQuery } from '@tanstack/react-query'
import { Link as LinkIcon, Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { postgresUserApi } from '@/modules/user/api'

import type { Link as LinkType } from '@/src/types/user'

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
    queryKey: ['publicProfile', userId],
  })

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  if (isError || !userProfile) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Card className='w-full max-w-md bg-error-container p-6 text-center shadow-elevation-2'>
          <h2 className='text-2xl font-bold text-on-error'>Perfil no encontrado</h2>
          <p className='text-on-error/80'>El perfil solicitado no existe o no es público.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <Card className='overflow-hidden shadow-lg'>
        <div className='relative h-48 w-full bg-gradient-to-r from-purple-500 to-indigo-600'>
          {userProfile.profile?.backgroundImageUrl && (
            <img
              src={userProfile.profile.backgroundImageUrl}
              alt='Background'
              className='size-full object-cover'
            />
          )}
          <div className='absolute -bottom-16 left-8'>
            <Avatar className='size-32 border-4 border-white shadow-lg'>
              {userProfile.profile?.avatarUrl ? (
                <AvatarImage src={userProfile.profile.avatarUrl} alt='Avatar' />
              ) : (
                <AvatarFallback className='text-5xl font-bold'>
                  {userProfile.firstName.charAt(0).toUpperCase()}{' '}
                  {userProfile.lastName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>
        <CardContent className='p-8 pt-20'>
          <h1 className='text-4xl font-bold text-gray-900'>
            {userProfile.firstName} {userProfile.lastName}
          </h1>
          {userProfile.profile?.occupation && (
            <p className='mt-2 text-xl text-gray-600'>{userProfile.profile.occupation}</p>
          )}
          <div className='mt-4 flex items-center text-gray-700'>
            <Mail className='mr-2 size-5' />
            <span>{userProfile.email}</span>
          </div>

          {userProfile.profile?.bio && (
            <p className='mt-6 leading-relaxed text-gray-800'>{userProfile.profile.bio}</p>
          )}

          {userProfile.profile?.description && (
            <p className='mt-4 leading-relaxed text-gray-700'>{userProfile.profile.description}</p>
          )}

          {userProfile.links && userProfile.links.length > 0 && (
            <div className='mt-8'>
              <h2 className='mb-4 text-2xl font-semibold text-gray-900'>Enlaces</h2>
              <div className='flex flex-wrap gap-4'>
                {userProfile.links.map((link: LinkType) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  >
                    <LinkIcon className='mr-2 size-4' />
                    {link.platform}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
