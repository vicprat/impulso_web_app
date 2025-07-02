'use client'

import { type Table } from '@tanstack/react-table'
import { Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { type Event } from '@/models/Event'
import { useDeleteMultipleEvents } from '@/src/services/event/hook'

import { Dialog } from './Dialog'

interface Props {
  table: Table<Event>
}

export const TableSelectionToolbar: React.FC<Props> = ({ table }) => {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedEvents = selectedRows.map((row) => row.original)
  const { deleteMultiple, isPending } = useDeleteMultipleEvents()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteClick = () => {
    if (selectedEvents.length === 0) return
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    const eventIds = selectedEvents.map((event) => event.id)
    await deleteMultiple(eventIds)
    table.resetRowSelection()
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  const handleClearSelection = () => {
    table.resetRowSelection()
  }

  if (selectedEvents.length === 0) {
    return null
  }

  const getConfirmMessage = () => {
    if (selectedEvents.length === 1) {
      return `¿Estás seguro de que quieres eliminar el evento "${selectedEvents[0].title}"? Esta acción no se puede deshacer.`
    }
    return `¿Estás seguro de que quieres eliminar ${selectedEvents.length} eventos seleccionados? Esta acción no se puede deshacer.`
  }

  const getConfirmTitle = () => {
    return selectedEvents.length === 1 ? 'Eliminar evento' : 'Eliminar eventos'
  }

  return (
    <>
      <div className=' mb-4 flex items-center justify-between  p-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>
            {selectedEvents.length} evento{selectedEvents.length > 1 ? 's' : ''} seleccionado
            {selectedEvents.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handleClearSelection} className='h-8'>
            <X className='mr-1 size-4' />
            Limpiar selección
          </Button>

          <Button
            variant='destructive'
            size='sm'
            onClick={handleDeleteClick}
            disabled={isPending}
            className='h-8'
          >
            <Trash2 className='mr-1 size-4' />
            {isPending
              ? 'Eliminando...'
              : `Eliminar ${selectedEvents.length > 1 ? `(${selectedEvents.length})` : ''}`}
          </Button>
        </div>
      </div>

      <Dialog.Confirm
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={isPending}
      />
    </>
  )
}
