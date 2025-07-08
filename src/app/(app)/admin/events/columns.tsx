'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { BarChart3, Edit, Eye, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type Event } from '@/models/Event'
import { useGetFinancialEvents } from '@/services/financial-events/hooks'
import { Dialog } from '@/src/components/Dialog'
import { useDeleteEvent } from '@/src/services/event/hook'

const ActionsCell = ({ event }: { event: Event }) => {
  const router = useRouter()
  const deleteEventMutation = useDeleteEvent()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: financialEvents, isLoading: isLoadingFinancialEvents } = useGetFinancialEvents()

  const handleEdit = () => {
    const numericId = event.id.split('/').pop()
    router.push(`/admin/events/${numericId}`)
  }

  const handleView = () => {
    router.push(`/store/event/${event.handle}`)
  }

  const handleFinancialManagement = () => {
    const shopifyId = event.id.split('/').pop()

    const financialEvent = financialEvents?.find((fe) => fe.shopifyProductId === shopifyId)

    if (financialEvent) {
      router.push(`/admin/events/manage/${financialEvent.id}`)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    await deleteEventMutation.mutateAsync(event.id)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleView}
          className='size-8 p-0'
          title='Ver evento'
        >
          <Eye className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleEdit}
          className='size-8 p-0'
          title='Editar evento'
        >
          <Edit className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleFinancialManagement}
          className='size-8 p-0 text-blue-600 hover:text-blue-700'
          title={
            isLoadingFinancialEvents
              ? 'Cargando datos financieros...'
              : financialEvents
                ? 'Gestión financiera'
                : 'Evento financiero no encontrado'
          }
          disabled={isLoadingFinancialEvents || !financialEvents}
        >
          <BarChart3 className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleDeleteClick}
          disabled={deleteEventMutation.isPending}
          className='size-8 p-0 text-red-600 hover:text-red-700 disabled:opacity-50'
          title='Eliminar evento'
        >
          <Trash2 className='size-4' />
        </Button>
      </div>

      <Dialog.Confirm
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title='Eliminar evento'
        message={`¿Estás seguro de que quieres eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={deleteEventMutation.isPending}
      />
    </>
  )
}

export const columns: ColumnDef<Event>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todos'
      />
    ),
    id: 'select',
  },
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>{status}</Badge>
    },
    header: 'Estado',
  },
  {
    accessorKey: 'eventDetails.date',
    header: 'Fecha',
  },
  {
    accessorKey: 'eventDetails.location',
    header: 'Ubicación',
  },
  {
    cell: ({ row }) => {
      const event = row.original
      const inventoryQuantity = event.variants[0]?.inventoryQuantity ?? 0
      return <span>{inventoryQuantity}</span>
    },
    header: 'Boletos Vendidos',
    id: 'inventoryQuantity',
  },
  {
    cell: ({ row }) => {
      const event = row.original
      return <ActionsCell event={event} />
    },
    id: 'actions',
  },
]
