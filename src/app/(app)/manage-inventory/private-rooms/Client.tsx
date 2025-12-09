'use client'

import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArrowLeft, Calendar, Package, PlusCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card as ShadcnCard } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table } from '@/src/components/Table'
import { ROUTES } from '@/src/config/routes'

import { columns } from './columns'

interface PrivateRoom {
  id: string
  name: string
  description?: string
  userId?: string
  user?: {
    email: string
    firstName: string
    lastName: string
  }
  users?: {
    id: string
    userId: string
    user?: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
    }
  }[]
  products: { id: string; productId: string }[]
  createdAt: string
  updatedAt: string
}

export function Client() {
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

  const table = useReactTable({
    columns,
    data: privateRooms,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onRefresh: loadPrivateRooms,
    },
  })

  if (isLoading) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-10 w-32' />
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar salas privadas</h3>
            <p className='mt-2 text-muted-foreground'>{error}</p>
            <Button onClick={loadPrivateRooms} className='mt-4'>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
      <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div>
          <div className='mb-2 flex items-center space-x-2'>
            <Link href={ROUTES.INVENTORY.MAIN.PATH}>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='mr-2 size-4' />
                Volver al Inventario
              </Button>
            </Link>
          </div>
          <h1 className='text-2xl font-bold'>Gestión de Salas Privadas</h1>
          <p className='text-muted-foreground'>
            Administra experiencias personalizadas para clientes VIP
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={loadPrivateRooms} disabled={isLoading}>
            Actualizar
          </Button>
          <Link href={ROUTES.INVENTORY.PRIVATE_ROOMS.CREATE.PATH}>
            <Button>
              <PlusCircle className='mr-2 size-4' />
              Nueva Sala Privada
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <ShadcnCard className='p-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-lg p-2'>
              <Users className='size-5 text-primary' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Total Salas</p>
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
              <p className='text-sm text-muted-foreground'>Total Productos</p>
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
              <p className='text-sm text-muted-foreground'>Activas Este Mes</p>
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
        <Table.Loader />
      ) : (
        <div className='w-full min-w-0 max-w-full overflow-x-auto pb-2'>
          <Table.Data
            table={table}
            className='min-w-[900px]'
            emptyMessage='No se encontraron salas privadas.'
          />
        </div>
      )}

      {privateRooms.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {privateRooms.length} salas privadas
        </div>
      )}
    </div>
  )
}
