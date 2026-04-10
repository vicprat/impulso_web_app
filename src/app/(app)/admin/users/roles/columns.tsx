'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { Edit2, Trash2, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface Role {
  id: string
  name: string
  description: string | null
  isAdmin: boolean
  userCount: number
  permissions: {
    id: string
    name: string
    description: string | null
  }[]
}

export interface RoleTableMeta {
  onEditRole: (role: Role) => void
  onDeleteRole: (role: Role) => void
}

const columnHelper = createColumnHelper<Role>()

export const columns = [
  columnHelper.accessor('name', {
    cell: (info) => (
      <div className='flex items-center gap-2'>
        <span className='font-medium capitalize'>{info.getValue()}</span>
        {info.row.original.isAdmin && (
          <Badge variant='default' className='text-xs'>
            Admin
          </Badge>
        )}
      </div>
    ),
    header: 'Role',
  }),
  columnHelper.accessor('description', {
    cell: (info) => (
      <span className='text-muted-foreground'>{info.getValue() || 'Sin descripción'}</span>
    ),
    header: 'Descripción',
  }),
  columnHelper.accessor('userCount', {
    cell: (info) => (
      <div className='flex items-center gap-1 text-muted-foreground'>
        <Users className='size-4' />
        {info.getValue()}
      </div>
    ),
    header: 'Usuarios',
  }),
  columnHelper.accessor('permissions', {
    cell: (info) => {
      const permissions = info.getValue()
      return (
        <div className='flex flex-wrap gap-1'>
          {permissions.slice(0, 3).map((perm) => (
            <Badge key={perm.id} variant='outline' className='text-xs'>
              {perm.name}
            </Badge>
          ))}
          {permissions.length > 3 && (
            <Badge variant='outline' className='text-xs'>
              +{permissions.length - 3}
            </Badge>
          )}
          {permissions.length === 0 && (
            <span className='text-xs text-muted-foreground'>Sin permisos</span>
          )}
        </div>
      )
    },
    header: 'Permisos',
  }),
  columnHelper.display({
    cell: (info) => {
      const role = info.row.original
      const meta = info.table.options.meta as RoleTableMeta

      return (
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' size='icon' onClick={() => meta.onEditRole(role)}>
            <Edit2 className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => meta.onDeleteRole(role)}
            disabled={role.userCount > 0 || role.isAdmin}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      )
    },
    header: 'Acciones',
    id: 'actions',
  }),
]
