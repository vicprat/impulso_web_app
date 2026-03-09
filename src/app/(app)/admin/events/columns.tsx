'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, BarChart3, Edit, Ticket, Trash2 } from 'lucide-react'
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

  const handleOrders = () => {
    const numericId = event.id.split('/').pop()
    router.push(`/admin/events/${numericId}/tickets`)
  }

  const handleFinancialManagement = () => {
    const shopifyId = event.id.split('/').pop()

    const financialEvent = financialEvents?.find((fe) => fe.shopifyProductId === shopifyId)

    if (financialEvent) {
      router.push(`/admin/events/${financialEvent.id}/finance`)
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
          onClick={handleOrders}
          className='size-8 p-0'
          title='Ver órdenes'
        >
          <Ticket className='size-4' />
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
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Título
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>{status}</Badge>
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Estado
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'eventDetails.date',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Fecha
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'eventDetails.location',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Ubicación
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorFn: (row) => row.variants?.[0]?.inventoryQuantity ?? 0,
    cell: ({ getValue }) => {
      const inventoryQuantity = getValue() as number
      return <span>{inventoryQuantity}</span>
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Boletos Disponibles
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
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
