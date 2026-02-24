'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Edit, MapPin, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Button } from '@/components/ui/button'
import { useDeleteArrendamiento } from '@/services/product/hook'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

interface Arrendamiento {
  id: string
  name: string
  isActive?: boolean
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onRefresh?: () => void
  }
}

const ActionsCell = ({
  arrendamiento,
  onRefresh,
}: {
  arrendamiento: Arrendamiento
  onRefresh?: () => void
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteArrendamientoMutation = useDeleteArrendamiento({
    onError: (error: any) => {
      toast.error(`Error al eliminar arrendamiento: ${error.message}`)
      setIsDeleteDialogOpen(false)
    },
    onSuccess: () => {
      toast.success('Arrendamiento eliminado exitosamente')
      setIsDeleteDialogOpen(false)
      onRefresh?.()
    },
  })

  const handleDeleteConfirm = async () => {
    await deleteArrendamientoMutation.mutateAsync(arrendamiento.id)
  }

  return (
    <>
      <div className='flex items-center space-x-2'>
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.ARRENDAMIENTOS.DETAIL.PATH, {
            id: arrendamiento.id,
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
        message={`¿Estás seguro de que quieres eliminar el arrendamiento "${arrendamiento.name}"? Esta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        variant='destructive'
        isLoading={deleteArrendamientoMutation.isPending}
      />
    </>
  )
}

export const columns: ColumnDef<Arrendamiento>[] = [
  {
    accessorKey: 'name',
    cell: ({ row }) => {
      const arrendamiento = row.original
      return (
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.ARRENDAMIENTOS.DETAIL.PATH, {
            id: arrendamiento.id,
          })}
          className='flex items-center gap-2 font-medium hover:underline'
        >
          <MapPin className='size-4 text-blue-500' />
          {arrendamiento.name}
        </Link>
      )
    },
    header: 'Nombre',
  },

  {
    cell: ({ row, table }) => {
      const arrendamiento = row.original
      const { onRefresh } = table.options.meta ?? {}
      return <ActionsCell arrendamiento={arrendamiento} onRefresh={onRefresh} />
    },
    header: 'Acciones',
    id: 'actions',
  },
]
