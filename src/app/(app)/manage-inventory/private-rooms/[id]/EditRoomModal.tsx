'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUpdatePrivateRoom } from '@/modules/rooms/hooks'
import { type PrivateRoom } from '@/modules/rooms/types'

const roomSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
})

type RoomFormData = z.infer<typeof roomSchema>

interface EditRoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: PrivateRoom | null
  onSuccess?: () => void
}

export function EditRoomModal({ isOpen, onClose, room, onSuccess }: EditRoomModalProps) {
  const form = useForm<RoomFormData>({
    defaultValues: {
      description: room?.description ?? '',
      name: room?.name ?? '',
    },
    resolver: zodResolver(roomSchema),
  })

  useEffect(() => {
    if (room) {
      form.reset({
        description: room.description ?? '',
        name: room.name ?? '',
      })
    }
  }, [room, form])

  const updateRoomMutation = useUpdatePrivateRoom()

  const onSubmit = async (data: RoomFormData) => {
    if (!room) return

    try {
      await updateRoomMutation.mutateAsync({
        id: room.id,
        data: {
          description: data.description ?? undefined,
          name: data.name,
        },
      })

      toast.success('Sala privada actualizada exitosamente')
      form.reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error updating room:', error)
      toast.error(`Error al actualizar sala: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const isLoading = updateRoomMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Editar Sala Privada</DialogTitle>
          <DialogDescription>
            Actualiza el nombre y la descripción de la sala privada
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Nombre de la sala...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Descripción de la sala...'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

