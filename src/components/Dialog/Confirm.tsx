'use client'

import { AlertTriangle, LoaderIcon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

export const Confirm: React.FC<Props> = ({
  cancelButtonText = 'Cancelar',
  confirmButtonText = 'Confirmar',
  isLoading = false,
  isOpen,
  message,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
}) => {
  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
              <AlertTriangle className='size-5 text-red-600 dark:text-red-400' />
            </div>
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className='text-left'>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant='container-destructive' onClick={onClose} disabled={isLoading}>
            {cancelButtonText}
          </Button>
          <Button variant='destructive' onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? <LoaderIcon className='size-8 animate-spin' /> : confirmButtonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
