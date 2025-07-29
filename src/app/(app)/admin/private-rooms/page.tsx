'use client'

import { Calendar, Edit3, ExternalLink, Eye, Package, Plus, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Card } from '@/components/Card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card as ShadcnCard } from '@/components/ui/card'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

interface PrivateRoom {
  id: string
  name: string
  description?: string
  userId: string
  user?: {
    email: string
    firstName: string
    lastName: string
  }
  products: { id: string; productId: string }[]
  createdAt: string
  updatedAt: string
}

export default function PrivateRoomsListPage() {
  const [privateRooms, setPrivateRooms] = useState<PrivateRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadPrivateRooms()
  }, [])

  const loadPrivateRooms = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/private-rooms')
      if (!response.ok) {
        throw new Error('Failed to load private rooms')
      }

      const data = await response.json()
      setPrivateRooms(data.privateRooms ?? data)
    } catch (error) {
      console.error('Error loading private rooms:', error)
      setError(error instanceof Error ? error.message : 'Failed to load private rooms')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (error) {
    return (
      <div className='container mx-auto max-w-6xl p-6'>
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight'>Private Rooms</h1>
            <p className='text-muted-foreground'>
              Manage personalized shopping experiences for VIP customers
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button asChild>
              <Link href={ROUTES.ADMIN.PRIVATE_ROOMS.CREATE.PATH}>
                <Plus className='mr-2 size-5' />
                Create New Room
              </Link>
            </Button>
            <Button variant='outline' onClick={loadPrivateRooms} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <ShadcnCard className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 rounded-lg p-2'>
                <Users className='size-5 text-primary' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Total Rooms</p>
                <p className='text-2xl font-bold'>{privateRooms.length}</p>
              </div>
            </div>
          </ShadcnCard>

          <ShadcnCard className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2'>
                <Package className='size-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Total Products</p>
                <p className='text-2xl font-bold'>
                  {privateRooms.reduce((acc, room) => acc + room.products.length, 0)}
                </p>
              </div>
            </div>
          </ShadcnCard>

          <ShadcnCard className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-100 p-2'>
                <Calendar className='size-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Active This Month</p>
                <p className='text-2xl font-bold'>
                  {
                    privateRooms.filter(
                      (room) => new Date(room.createdAt).getMonth() === new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
            </div>
          </ShadcnCard>
        </div>

        {isLoading ? (
          <Card.Loader />
        ) : privateRooms.length === 0 ? (
          <ShadcnCard className='p-12'>
            <div className='space-y-4 text-center'>
              <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-muted'>
                <Users className='size-8 text-muted-foreground' />
              </div>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>No Private Rooms Yet</h3>
                <p className='text-muted-foreground'>
                  Create your first private room to get started with personalized shopping
                  experiences.
                </p>
              </div>
              <Button asChild>
                <Link href={ROUTES.ADMIN.PRIVATE_ROOMS.CREATE.PATH}>
                  <Plus className='mr-2 size-4' />
                  Create First Room
                </Link>
              </Button>
            </div>
          </ShadcnCard>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {privateRooms.map((room) => (
              <ShadcnCard key={room.id} className='p-6 transition-shadow hover:shadow-lg'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Link
                      href={replaceRouteParams(ROUTES.ADMIN.PRIVATE_ROOMS.DETAIL.PATH, { id: room.id })}
                      className='group block'
                    >
                      <h3 className='line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary'>
                        {room.name}
                        <ExternalLink className='ml-1 inline size-4 opacity-0 transition-opacity group-hover:opacity-100' />
                      </h3>
                    </Link>
                    {room.description && (
                      <p className='line-clamp-2 text-sm text-muted-foreground'>
                        {room.description}
                      </p>
                    )}
                  </div>

                  {room.user && (
                    <div className='flex items-center gap-2 text-sm'>
                      <Users className='size-4 text-muted-foreground' />
                      <span className='truncate'>
                        {room.user.firstName} {room.user.lastName}
                      </span>
                    </div>
                  )}

                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-1'>
                      <Package className='size-4 text-muted-foreground' />
                      <span>{room.products.length} products</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Calendar className='size-4 text-muted-foreground' />
                      <span>{formatDate(room.createdAt)}</span>
                    </div>
                  </div>

                  <div className='grid grid-cols-3 gap-2'>
                    <Button size='sm' variant='outline' asChild>
                      <Link
                        href={replaceRouteParams(ROUTES.ADMIN.PRIVATE_ROOMS.DETAIL.PATH, { id: room.id })}
                      >
                        <Eye className='mr-1 size-3' />
                        View
                      </Link>
                    </Button>

                    <Button size='sm' variant='outline' asChild>
                      <Link
                        href={replaceRouteParams(ROUTES.ADMIN.PRIVATE_ROOMS.DETAIL.PATH, { id: room.id })}
                      >
                        <Edit3 className='mr-1 size-3' />
                        Edit
                      </Link>
                    </Button>

                    <Button size='sm' variant='destructive' asChild>
                      <Link
                        href={replaceRouteParams(ROUTES.ADMIN.PRIVATE_ROOMS.DETAIL.PATH, {
                          id: room.id,
                          mode: 'delete',
                        })}
                      >
                        <Trash2 className='mr-1 size-3' />
                        Delete
                      </Link>
                    </Button>
                  </div>
                </div>
              </ShadcnCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
