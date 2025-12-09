'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Edit, MapPin, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Button } from '@/components/ui/button'
import { useDeleteLocation } from '@/services/product/hook'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

interface Location {
  id: string
  name: string
  isActive?: boolean
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onRefresh?: () => void
  }
}

const ActionsCell = ({ location, onRefresh }: { location: Location; onRefresh?: () => void }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteLocationMutation = useDeleteLocation({
    onError: (error: any) => {
      toast.error(`Error al eliminar localización: ${error.message}`)
      setIsDeleteDialogOpen(false)
    },
    onSuccess: () => {
      toast.success('Localización eliminada exitosamente')
      setIsDeleteDialogOpen(false)
      onRefresh?.()
    },
  })

  const handleDeleteConfirm = async () => {
    await deleteLocationMutation.mutateAsync(location.id)
  }

  return (
    <>
      <div className='flex items-center space-x-2'>
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.LOCATIONS.DETAIL.PATH, {
            id: location.id,
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
        message={`¿Estás seguro de que quieres eliminar la localización "${location.name}"? Esta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        variant='destructive'
        isLoading={deleteLocationMutation.isPending}
      />
    </>
  )
}

export const columns: ColumnDef<Location>[] = [
  {
    accessorKey: 'name',
    cell: ({ row }) => {
      const location = row.original
      return (
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.LOCATIONS.DETAIL.PATH, {
            id: location.id,
          })}
          className='flex items-center gap-2 font-medium hover:underline'
        >
          <MapPin className='size-4 text-blue-500' />
          {location.name}
        </Link>
      )
    },
    header: 'Nombre',
  },

  {
    cell: ({ row, table }) => {
      const location = row.original
      const { onRefresh } = table.options.meta ?? {}
      return <ActionsCell location={location} onRefresh={onRefresh} />
    },
    header: 'Acciones',
    id: 'actions',
  },
]
