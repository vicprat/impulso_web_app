'use client'

import { type UseMutationResult } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { type UserProfile } from '@/modules/user/types'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

export interface UserTableMeta {
  deactivateUser: UseMutationResult<void, Error, string, unknown>
  reactivateUser: UseMutationResult<void, Error, string, unknown>
  handleManageRoles: (user: UserProfile) => void
  handleToggleUserStatus: (user: UserProfile) => void
  toggleUserPublicStatus: (userId: string, isPublic: boolean) => void
}

export const columns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: 'firstName',
    cell: ({ row }) => {
      const user = row.original
      const isArtist = user.roles.includes('artist')

      return (
        <div className='flex items-center'>
          <div className='size-10 shrink-0'>
            {user.shopifyData?.imageUrl ? (
              <img
                className='size-10 rounded-full object-cover'
                src={user.shopifyData.imageUrl}
                alt=''
              />
            ) : (
              <div className='flex size-10 items-center justify-center rounded-full bg-gray-300'>
                <span className='font-medium text-gray-600'>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
          <div className='ml-4'>
            <div className='text-sm font-medium '>
              {user.firstName} {user.lastName}
            </div>
            <div className='text-sm text-gray-500'>ID: {user.id.slice(0, 8)}...</div>
            {isArtist && user.artist?.name && (
              <div className='text-xs font-medium text-blue-600'>Artista: {user.artist.name}</div>
            )}
          </div>
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Usuario
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
  },
  {
    accessorKey: 'email',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div>
          <div>{user.email}</div>
          <div>Shopify: {user.shopifyCustomerId?.slice(-8)}</div>
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
  },
  {
    accessorKey: 'roles',
    cell: ({ row }) => {
      const user = row.original
      return (
        <Badge variant='outline' className='capitalize'>
          {user.roles[0]?.replace('_', ' ') || 'Sin rol'}
        </Badge>
      )
    },
    header: 'Rol',
  },
  {
    accessorKey: 'isActive',
    cell: ({ row }) => {
      const user = row.original
      return (
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    header: 'Estado',
  },

  {
    accessorKey: 'isPublic',
    cell: ({ row, table }) => {
      const user = row.original
      const meta = table.options.meta as UserTableMeta | undefined

      const restrictedRoles = ['customer', 'vip_customer']
      const hasRestrictedRole = user.roles.some((role) => restrictedRoles.includes(role))

      if (hasRestrictedRole) {
        return (
          <div className='flex items-center'>
            <span className='text-sm text-gray-400'></span>
          </div>
        )
      }

      return (
        <Switch
          checked={user.isPublic}
          onCheckedChange={(checked) => meta?.toggleUserPublicStatus(user.id, checked)}
          aria-label='Toggle public status'
        />
      )
    },
    header: 'Público',
  },
  {
    accessorKey: 'lastLoginAt',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className='text-sm text-gray-500'>
          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Último acceso
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
  },
  {
    cell: ({ row, table }) => {
      const user = row.original
      const meta = table.options.meta as UserTableMeta | undefined

      return (
        <div className='flex items-center space-x-2'>
          <Link href={replaceRouteParams(ROUTES.ADMIN.USERS.DETAIL.PATH, { id: user.id })}>
            <Button variant='ghost' size='sm'>
              <Eye className='size-4' />
            </Button>
          </Link>
          <Button variant='ghost' size='sm' onClick={() => meta?.handleManageRoles(user)}>
            <Edit className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => meta?.handleToggleUserStatus(user)}
            disabled={meta?.deactivateUser.isPending ?? meta?.reactivateUser.isPending}
            className={user.isActive ? 'text-red-600' : 'text-green-600'}
          >
            {user.isActive ? 'Desactivar' : 'Activar'}
            <Trash2 className='mr-2 size-4' />
          </Button>
        </div>
      )
    },
    id: 'actions',
  },
]
