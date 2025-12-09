'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Calendar, Edit3, Eye, Package, Trash2, Users } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

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

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onRefresh?: () => void
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const columns: ColumnDef<PrivateRoom>[] = [
  {
    accessorKey: 'name',
    cell: ({ row }) => {
      const room = row.original
      return (
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.PRIVATE_ROOMS.DETAIL.PATH, {
            id: room.id,
          })}
          className='font-medium hover:underline'
        >
          {room.name}
        </Link>
      )
    },
    header: 'Nombre',
  },
  {
    accessorKey: 'description',
    cell: ({ row }) => {
      const description = row.original.description
      return (
        <span className='line-clamp-2 text-sm text-muted-foreground'>{description || '-'}</span>
      )
    },
    header: 'Descripción',
  },
  {
    accessorKey: 'users',
    cell: ({ row }) => {
      const room = row.original
      const userCount = room.users?.length ?? 0

      if (userCount === 0) {
        return <span className='text-sm text-muted-foreground'>Sin usuarios</span>
      }

      return (
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <Users className='size-4 text-muted-foreground' />
            <span className='text-sm'>{userCount} usuarios</span>
          </div>
        </div>
      )
    },
    header: 'Usuarios',
  },
  {
    accessorKey: 'products',
    cell: ({ row }) => {
      const productsCount = row.original.products.length
      return (
        <div className='flex items-center gap-1'>
          <Package className='size-4 text-muted-foreground' />
          <span className='text-sm'>{productsCount} productos</span>
        </div>
      )
    },
    header: 'Productos',
  },
  {
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-1'>
          <Calendar className='size-4 text-muted-foreground' />
          <span className='text-sm'>{formatDate(row.original.createdAt)}</span>
        </div>
      )
    },
    header: 'Fecha de Creación',
  },
  {
    cell: ({ row }) => {
      const room = row.original
      return (
        <div className='flex items-center space-x-2'>
          <Link
            href={replaceRouteParams(ROUTES.INVENTORY.PRIVATE_ROOMS.DETAIL.PATH, {
              id: room.id,
            })}
          >
            <Button variant='ghost' size='sm'>
              <Eye className='size-4' />
            </Button>
          </Link>
          <Link
            href={replaceRouteParams(ROUTES.INVENTORY.PRIVATE_ROOMS.DETAIL.PATH, {
              id: room.id,
            })}
          >
            <Button variant='ghost' size='sm'>
              <Edit3 className='size-4' />
            </Button>
          </Link>
          <Link
            href={replaceRouteParams(ROUTES.INVENTORY.PRIVATE_ROOMS.DETAIL.PATH, {
              id: room.id,
              mode: 'delete',
            })}
          >
            <Button variant='ghost' size='sm' className='text-destructive hover:text-destructive'>
              <Trash2 className='size-4' />
            </Button>
          </Link>
        </div>
      )
    },
    header: 'Acciones',
    id: 'actions',
  },
]
