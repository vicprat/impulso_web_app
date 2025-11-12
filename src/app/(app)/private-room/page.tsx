'use client'

import { ChevronRight, Lock, Package } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card as ShadcnCard } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useUserPrivateRooms } from '@/modules/rooms/hooks'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

export default function PrivateRoomPage() {
  const { user } = useAuth()
  const userId = user?.id

  const { data: privateRooms, error: roomError, isLoading } = useUserPrivateRooms(userId ?? '')

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-7xl p-6'>
        <div className='space-y-6'>
          <div className='space-y-3'>
            <Skeleton className='h-10 w-80' />
            <Skeleton className='h-4 w-96' />
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-48' />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (roomError) {
    const isNoPrivateRoomsError = roomError?.message === 'No tienes salas privadas asignadas'

    if (isNoPrivateRoomsError) {
      return (
        <div className='container mx-auto max-w-4xl p-6'>
          <div className='space-y-6 py-12 text-center'>
            <div className='mx-auto flex size-24 items-center justify-center rounded-full bg-muted'>
              <Lock className='size-12 text-muted-foreground' />
            </div>
            <div className='space-y-2'>
              <h1 className='text-2xl font-bold'>No tienes salas privadas asignadas</h1>
              <p className='text-muted-foreground'>
                Actualmente no tienes salas privadas asignadas. Contacta con soporte para obtener
                acceso a tu experiencia VIP personalizada.
              </p>
            </div>
            <Button asChild>
              <Link href='/contact'>Contactar Soporte</Link>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <Alert variant='destructive'>
          <AlertDescription>
            Error loading your private rooms: {roomError?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!privateRooms || privateRooms.length === 0) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='space-y-6 py-12 text-center'>
          <div className='mx-auto flex size-24 items-center justify-center rounded-full bg-muted'>
            <Lock className='size-12 text-muted-foreground' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>No Private Rooms Available</h1>
            <p className='text-muted-foreground'>
              You don't have any private rooms assigned yet. Contact us to set up your personalized
              shopping experience.
            </p>
          </div>
          <Button asChild>
            <Link href='/contact'>Contact Support</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='space-y-8'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Mis Salas Privadas</h1>
          <p className='text-muted-foreground'>
            Explora tus colecciones personalizadas y productos seleccionados exclusivamente para ti
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {privateRooms.map((room) => (
            <Link
              key={room.id}
              href={replaceRouteParams(ROUTES.ADMIN.PRIVATE_ROOMS.ACCESS_DETAIL.PATH, {
                id: room.id,
              })}
            >
              <ShadcnCard className='group h-full transition-all duration-200 hover:shadow-lg'>
                <div className='p-6'>
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='bg-primary/10 rounded-lg p-3'>
                      <Lock className='size-6 text-primary' />
                    </div>
                    <ChevronRight className='size-5 text-muted-foreground transition-transform group-hover:translate-x-1' />
                  </div>

                  <div className='space-y-3'>
                    <div>
                      <h3 className='text-xl font-semibold'>{room.name}</h3>
                      {room.description && (
                        <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                          {room.description}
                        </p>
                      )}
                    </div>

                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Package className='size-4' />
                        <span>{room.products.length} productos</span>
                      </div>
                    </div>

                    <div className='pt-2'>
                      <Badge variant='secondary' className='text-xs'>
                        VIP Collection
                      </Badge>
                    </div>
                  </div>
                </div>
              </ShadcnCard>
            </Link>
          ))}
        </div>

        <ShadcnCard className='border-primary/20 p-8'>
          <div className='space-y-4 text-center'>
            <h3 className='text-xl font-semibold'>¿Necesitas ayuda?</h3>
            <p className='text-muted-foreground'>
              Si tienes alguna pregunta sobre tus salas privadas o necesitas asistencia, no dudes en
              contactarnos.
            </p>
            <Button variant='outline' asChild>
              <Link href='/contact'>Contactar Soporte</Link>
            </Button>
          </div>
        </ShadcnCard>
      </div>
    </div>
  )
}
