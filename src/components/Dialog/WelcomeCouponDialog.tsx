'use client'

import { Copy, Gift, Tag } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWelcomeCoupon } from '@/hooks/useWelcomeCoupon'

export function WelcomeCouponDialog() {
  const { isLoading, markAsShown, shouldShowDialog, welcomeCoupon } = useWelcomeCoupon()

  const handleCopyCode = useCallback(() => {
    if (welcomeCoupon?.code) {
      void navigator.clipboard.writeText(welcomeCoupon.code)
      toast.success('Código copiado al portapapeles')
    }
  }, [welcomeCoupon?.code])

  const handleClose = useCallback(() => {
    markAsShown()
  }, [markAsShown])

  if (!shouldShowDialog || isLoading) {
    return null
  }

  return (
    <Dialog open={shouldShowDialog} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className='rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2'>
                <Gift className='size-5 text-white' />
              </div>
              <DialogTitle className='text-xl font-bold'>¡Bienvenido a Impulso!</DialogTitle>
            </div>
          </div>
          <DialogDescription>Tienes un cupón especial para tu primera compra</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-4'>
            <div className='flex items-center justify-center space-x-2'>
              <Tag className='size-5 text-blue-600' />
              <span className='text-sm font-medium text-blue-800'>
                Descuento del {welcomeCoupon?.value}% en tu primera compra
              </span>
            </div>
          </div>

          <div className='rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 p-4 text-center'>
            <p className='mb-2 text-sm text-gray-300'>Tu código de descuento:</p>
            <div className='flex items-center justify-center space-x-2'>
              <code className='text-2xl font-bold tracking-wider text-white'>
                {welcomeCoupon?.code}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopyCode}
                className='size-8 p-0 text-white hover:bg-white/20'
              >
                <Copy className='size-4' />
              </Button>
            </div>
          </div>

          <div className='rounded-lg border border-green-200 bg-green-50 p-3'>
            <p className='text-center text-sm text-green-800'>
              <strong>Aplicable a:</strong> Todos los productos
            </p>
          </div>

          <div className='flex flex-col space-y-2'>
            <Button
              onClick={handleClose}
              className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            >
              ¡Empezar a comprar!
            </Button>
            <Button variant='outline' onClick={handleClose} className='w-full'>
              Ver más tarde
            </Button>
          </div>

          <p className='text-center text-xs text-gray-500'>
            Este cupón es válido solo para tu primera compra y está disponible por tiempo limitado.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
