'use client'

import { type Table } from '@tanstack/react-table'
import { Download, Trash2, X } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface GenericTableSelectionToolbarProps<TData> {
  table: Table<TData>
  onExportSelected?: () => void
  onBulkDelete?: () => void
  onBulkDeleteConfirm?: () => void
  customActions?: React.ReactNode
  isDeleting?: boolean
  deleteButtonText?: string
  deleteConfirmText?: string
}

export function GenericTableSelectionToolbar<TData>({
  customActions,
  deleteButtonText = 'Eliminar seleccionadas',
  deleteConfirmText = '¿Estás seguro de que quieres eliminar las entradas seleccionadas?',
  isDeleting = false,
  onBulkDelete,
  onBulkDeleteConfirm,
  onExportSelected,
  table,
}: GenericTableSelectionToolbarProps<TData>) {
  const selectedCount = Object.keys(table.getState().rowSelection).length

  if (selectedCount === 0) return null

  return (
    <div className='mb-4 flex items-center justify-between rounded-md border bg-muted p-4'>
      <div className='flex items-center space-x-2'>
        <span className='text-sm font-medium'>
          {selectedCount} fila{selectedCount > 1 ? 's' : ''} seleccionada
          {selectedCount > 1 ? 's' : ''}
        </span>
      </div>
      <div className='flex items-center space-x-2'>
        {customActions}

        {onExportSelected && (
          <Button variant='outline' size='sm' onClick={onExportSelected}>
            <Download className='mr-2 size-4' />
            Exportar seleccionadas
          </Button>
        )}

        {(onBulkDelete ?? onBulkDeleteConfirm) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' size='sm' disabled={isDeleting}>
                <Trash2 className='mr-2 size-4' />
                {isDeleting ? 'Eliminando...' : deleteButtonText}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteConfirmText}
                  <br />
                  <strong>Esta acción no se puede deshacer.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onBulkDeleteConfirm ?? onBulkDelete}
                  className='hover:bg-destructive/90 bg-destructive text-destructive-foreground'
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Button
          variant='ghost'
          size='sm'
          onClick={() => table.resetRowSelection()}
          className='size-8 p-0'
          disabled={isDeleting}
        >
          <X className='size-4' />
        </Button>
      </div>
    </div>
  )
}
