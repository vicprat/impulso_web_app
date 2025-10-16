'use client'

import { Truck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LineItem {
  id: string
  title: string
  quantity: number
}

interface CreateFulfillmentDialogProps {
  lineItems: LineItem[]
  orderId: string
  onSuccess?: () => void
}

export function CreateFulfillmentDialog({
  lineItems,
  onSuccess,
  orderId,
}: CreateFulfillmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [trackingCompany, setTrackingCompany] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [notifyCustomer, setNotifyCustomer] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/orders/${orderId}/fulfillment`, {
        body: JSON.stringify({
          lineItems: lineItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          notifyCustomer,
          trackingInfo:
            trackingCompany || trackingNumber || trackingUrl
              ? {
                  company: trackingCompany ?? undefined,
                  number: trackingNumber ?? undefined,
                  url: trackingUrl ?? undefined,
                }
              : undefined,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error ?? 'Error al crear el envío')
      }

      toast.success('Envío creado exitosamente')
      setOpen(false)
      onSuccess?.()

      setTrackingCompany('')
      setTrackingNumber('')
      setTrackingUrl('')
      setNotifyCustomer(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el envío')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='hover:bg-primary/90 bg-primary text-on-primary'>
          <Truck className='mr-2 size-4' />
          Crear Envío
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Envío</DialogTitle>
            <DialogDescription>
              Crea un nuevo envío para esta orden. Los productos serán marcados como enviados.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='company'>Compañía de Envío (Opcional)</Label>
              <Input
                id='company'
                placeholder='Ej: FedEx, DHL, Estafeta'
                value={trackingCompany}
                onChange={(e) => setTrackingCompany(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tracking'>Número de Rastreo (Opcional)</Label>
              <Input
                id='tracking'
                placeholder='Ej: 1234567890'
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='url'>URL de Rastreo (Opcional)</Label>
              <Input
                id='url'
                type='url'
                placeholder='https://...'
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='notify'
                checked={notifyCustomer}
                onCheckedChange={(checked) => setNotifyCustomer(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor='notify' className='cursor-pointer'>
                Notificar al cliente por email
              </Label>
            </div>

            <div className='rounded-lg bg-muted p-3'>
              <p className='text-sm font-medium'>Productos a enviar:</p>
              <ul className='mt-2 space-y-1'>
                {lineItems.map((item) => (
                  <li key={item.id} className='text-sm text-muted-foreground'>
                    • {item.title} (x{item.quantity})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Envío'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
