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
import { useCreateCollection, useUpdateCollection } from '@/services/collection/hooks'
import { ROUTES } from '@/src/config/routes'

import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@/services/collection/types'

// Función para generar slug automáticamente
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
}

const collectionSchema = z.object({
  description: z.string().optional(),
  handle: z.string().optional(),
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(255, 'El título no puede exceder 255 caracteres'),
})

type CollectionFormData = z.infer<typeof collectionSchema>

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  collection?: Collection | null
  onSuccess?: () => void
}

export function CollectionModal({ collection, isOpen, onClose, onSuccess }: CollectionModalProps) {
  const isEditing = !!collection

  const form = useForm<CollectionFormData>({
    defaultValues: {
      description: collection?.description ?? '',
      handle: collection?.handle ?? '',
      title: collection?.title ?? '',
    },
    resolver: zodResolver(collectionSchema),
  })

  // Actualizar el formulario cuando cambie la colección
  useEffect(() => {
    if (collection) {
      form.reset({
        description: collection.description ?? '',
        handle: collection.handle ?? '',
        title: collection.title ?? '',
      })
    } else {
      form.reset({
        description: '',
        handle: '',
        title: '',
      })
    }
  }, [collection, form])

  // Generar slug automáticamente cuando cambia el título (solo para creación)
  const watchedTitle = form.watch('title')
  const watchedHandle = form.watch('handle')
  const generatedSlug = watchedTitle ? generateSlug(watchedTitle) : ''

  // Usar el handle manual si existe, sino usar el generado
  const finalHandle = watchedHandle ?? generatedSlug

  const createCollectionMutation = useCreateCollection({
    onError: (error) => {
      toast.error(`Error al crear colección: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Colección creada exitosamente')
      form.reset()
      onClose()
      onSuccess?.()
    },
  })

  const updateCollectionMutation = useUpdateCollection({
    onError: (error) => {
      toast.error(`Error al actualizar colección: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Colección actualizada exitosamente')
      onClose()
      onSuccess?.()
    },
  })

  const onSubmit = async (data: CollectionFormData) => {
    try {
      if (isEditing && collection) {
        const updateData: UpdateCollectionInput = {
          id: collection.id,
          ...data,
        }
        await updateCollectionMutation.mutateAsync(updateData)
      } else {
        const createData: CreateCollectionInput = {
          ...data,
          handle: finalHandle, // Usar el handle final (manual o generado)
        }
        await createCollectionMutation.mutateAsync(createData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const isLoading = createCollectionMutation.isPending || updateCollectionMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Colección' : 'Crear Nueva Colección'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los detalles de la colección.'
              : 'Completa la información para crear una nueva colección.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder='Nombre de la colección' {...field} disabled={isLoading} />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe la colección'
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='handle'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle (URL)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={generatedSlug ?? 'url-de-la-coleccion'}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className='text-xs text-muted-foreground'>
                    {!isEditing
                      ? 'Se genera automáticamente basado en el título. Puedes editarlo si necesitas una URL específica.'
                      : 'Modifica la URL de la colección si es necesario.'}
                  </p>
                </FormItem>
              )}
            />

            {/* Mostrar la URL donde se encontrará la colección */}
            {finalHandle && (
              <div className='bg-muted/50 rounded-md p-3'>
                <p className='mb-1 text-sm font-medium text-muted-foreground'>
                  URL de la colección:
                </p>
                <p className='font-mono text-sm text-primary'>
                  {typeof window !== 'undefined' ? window.location.origin : ''}
                  {ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', finalHandle)}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {!isEditing
                    ? 'Esta URL se genera automáticamente basada en el título de la colección.'
                    : 'Esta es la URL actual de la colección.'}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className='mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : isEditing ? (
                  'Actualizar'
                ) : (
                  'Crear'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
