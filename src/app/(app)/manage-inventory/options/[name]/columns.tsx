'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Button } from '@/components/ui/button'
import { useDeleteOption } from '@/hooks/use-options'
import { type OptionConfig } from '@/src/config/options'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

interface Option {
  id: string
  name: string
  isActive?: boolean
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    optionName?: string
    onRefresh?: () => void
    config?: OptionConfig
  }
}

interface ActionsCellProps {
  option: Option
  optionName: string
  config?: OptionConfig
  onRefresh?: () => void
}

const ActionsCell = ({ config, onRefresh, option, optionName }: ActionsCellProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteOptionMutation = useDeleteOption(optionName, {
    onError: (error: Error) => {
      toast.error(
        `Error al eliminar ${config?.singularLabel.toLowerCase() ?? 'opción'}: ${error.message}`
      )
      setIsDeleteDialogOpen(false)
    },
    onSuccess: () => {
      toast.success(`${config?.singularLabel ?? 'Opción'} eliminada exitosamente`)
      setIsDeleteDialogOpen(false)
      onRefresh?.()
    },
  })

  const handleDeleteConfirm = async () => {
    await deleteOptionMutation.mutateAsync(option.id)
  }

  return (
    <>
      <div className='flex items-center space-x-2'>
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.OPTIONS.DETAIL.PATH, {
            id: option.id,
            name: optionName,
          })}
        >
          <Button variant='ghost' size='sm'>
            <Edit className='size-4' />
          </Button>
        </Link>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsDeleteDialogOpen(true)}
          className='text-destructive hover:text-destructive'
        >
          <Trash2 className='size-4' />
        </Button>
      </div>

      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Confirmar Eliminación'
        message={`¿Estás seguro de que quieres eliminar "${option.name}"? Esta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        variant='destructive'
        isLoading={deleteOptionMutation.isPending}
      />
    </>
  )
}

export const columns = (optionName: string, config?: OptionConfig): ColumnDef<Option>[] => [
  {
    accessorKey: 'name',
    cell: ({ row }) => {
      const option = row.original
      const Icon = config?.icon

      return (
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.OPTIONS.DETAIL.PATH, {
            id: option.id,
            name: optionName,
          })}
          className='flex items-center gap-2 font-medium hover:underline'
        >
          {Icon && <Icon className='size-4 text-blue-500' />}
          {option.name}
        </Link>
      )
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Nombre
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },

  {
    cell: ({ row, table }) => {
      const option = row.original
      const { config: tableConfig, onRefresh } = table.options.meta ?? {}
      return (
        <ActionsCell
          option={option}
          optionName={optionName}
          config={tableConfig ?? config}
          onRefresh={onRefresh}
        />
      )
    },
    header: 'Acciones',
    id: 'actions',
  },
]
