'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { ImageUploader } from '@/components/Forms/ImageUploader'
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

interface ProductImage {
  id: string
  url: string
  altText?: string
  width?: number
  height?: number
  productId: string
  productTitle: string
}

interface SelectedImage {
  id: string
  url: string
  altText?: string
  width?: number
  height?: number
  source: 'product' | 'upload'
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'upload'>('products')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const form = useForm<CollectionFormData>({
    defaultValues: {
      description: collection?.description ?? '',
      handle: collection?.handle ?? '',
      title: collection?.title ?? '',
    },
    resolver: zodResolver(collectionSchema),
  })

  useEffect(() => {
    if (collection?.id && isOpen) {
      setIsLoadingImages(true)
      fetch(`/api/shopify/collections/${encodeURIComponent(collection.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.products) {
            const images: ProductImage[] = []
            data.data.products.forEach((product: any) => {
              if (product.images && product.images.length > 0) {
                product.images.forEach((img: any) => {
                  images.push({
                    altText: img.altText,
                    height: img.height,
                    id: img.id,
                    productId: product.id,
                    productTitle: product.title,
                    url: img.url,
                    width: img.width,
                  })
                })
              }
            })
            setProductImages(images)
          }
        })
        .catch((error) => {
          console.error('Error cargando imágenes:', error)
        })
        .finally(() => {
          setIsLoadingImages(false)
        })
    }
  }, [collection?.id, isOpen])

  useEffect(() => {
    if (collection) {
      form.reset({
        description: collection.description ?? '',
        handle: collection.handle ?? '',
        title: collection.title ?? '',
      })
      if (collection.image) {
        setSelectedImage({
          ...collection.image,
          source: 'product',
        })
        setUploadedImageUrl(collection.image.url)
      }
    } else {
      form.reset({
        description: '',
        handle: '',
        title: '',
      })
      setSelectedImage(null)
      setUploadedImageUrl(null)
      setProductImages([])
      setActiveTab('upload')
    }
  }, [collection, form])

  const watchedTitle = form.watch('title')
  const watchedHandle = form.watch('handle')
  const generatedSlug = watchedTitle ? generateSlug(watchedTitle) : ''
  const finalHandle = watchedHandle ?? generatedSlug

  const createCollectionMutation = useCreateCollection({
    onError: (error) => {
      toast.error(`Error al crear colección: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Colección creada exitosamente')
      form.reset()
      setSelectedImage(null)
      setUploadedImageUrl(null)
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

  const handleSelectProductImage = (image: ProductImage) => {
    setSelectedImage({
      altText: image.altText,
      height: image.height,
      id: image.id,
      source: 'product',
      url: image.url,
      width: image.width,
    })
    setUploadedImageUrl(image.url)
  }

  const handleUploadComplete = (url: string | null) => {
    setUploadedImageUrl(url)
    if (url) {
      setSelectedImage({
        altText: form.getValues('title') || 'Imagen de portada',
        id: `uploaded-${Date.now()}`,
        source: 'upload',
        url: url,
      })
    } else {
      setSelectedImage(null)
    }
  }

  const handleClearSelection = () => {
    setSelectedImage(null)
    setUploadedImageUrl(null)
  }

  const onSubmit = async (data: CollectionFormData) => {
    try {
      const imageToSend = selectedImage
        ? {
            altText: selectedImage.altText ?? data.title,
            id: selectedImage.source === 'product' ? selectedImage.id : undefined,
            url: selectedImage.url,
          }
        : undefined

      if (isEditing && collection) {
        const updateData: UpdateCollectionInput = {
          description: data.description,
          handle: data.handle,
          id: collection.id,
          image: imageToSend,
          title: data.title,
        }
        await updateCollectionMutation.mutateAsync(updateData)
      } else {
        const createData: CreateCollectionInput = {
          description: data.description,
          handle: finalHandle,
          image: imageToSend,
          title: data.title,
        }
        await createCollectionMutation.mutateAsync(createData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedImage(null)
    setUploadedImageUrl(null)
    setProductImages([])
    setActiveTab('upload')
    onClose()
  }

  const isLoading = createCollectionMutation.isPending || updateCollectionMutation.isPending

  const hasProductImages = productImages.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
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

            {finalHandle && (
              <div className='rounded-md bg-muted/50 p-3'>
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

            <div className='space-y-3 rounded-md border p-4'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                  Imagen de portada
                </label>
                {selectedImage && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={handleClearSelection}
                    className='text-destructive hover:text-destructive'
                  >
                    <X className='mr-1 size-4' />
                    Quitar selección
                  </Button>
                )}
              </div>

              {selectedImage ? (
                <div className='relative overflow-hidden rounded-lg border'>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.altText ?? 'Imagen de portada'}
                    className='h-48 w-full object-cover'
                  />
                  <div className='absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white'>
                    <p className='text-xs'>
                      {selectedImage.source === 'upload'
                        ? 'Imagen subida'
                        : 'Imagen seleccionada de productos'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='rounded-lg border-2 border-dashed border-gray-300 bg-muted/30 py-8 text-center'>
                  <ImageIcon className='mx-auto mb-2 size-8 text-gray-400' />
                  <p className='text-sm text-gray-600'>Ninguna imagen seleccionada</p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {isEditing
                      ? 'Se usará la primera imagen de los productos como fallback'
                      : 'Selecciona una imagen de los productos o sube una nueva'}
                  </p>
                </div>
              )}

              <div className='flex border-b'>
                <button
                  type='button'
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isEditing ? `De productos (${productImages.length})` : 'De productos'}
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                    activeTab === 'upload'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Subir nueva
                </button>
              </div>

              {activeTab === 'products' ? (
                <div className='space-y-2'>
                  {isEditing ? (
                    isLoadingImages ? (
                      <div className='flex items-center justify-center py-8'>
                        <Loader2 className='size-6 animate-spin text-primary' />
                      </div>
                    ) : hasProductImages ? (
                      <div className='grid max-h-60 grid-cols-4 gap-2 overflow-y-auto p-1'>
                        {productImages.map((image) => (
                          <button
                            key={image.id}
                            type='button'
                            onClick={() => handleSelectProductImage(image)}
                            className={`group relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                              selectedImage?.id === image.id
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-transparent hover:border-primary/50'
                            }`}
                            title={`${image.productTitle}${image.altText ? ` - ${image.altText}` : ''}`}
                          >
                            <img
                              src={image.url}
                              alt={image.altText ?? image.productTitle}
                              className='size-full object-cover'
                            />
                            {selectedImage?.id === image.id && (
                              <div className='absolute inset-0 flex items-center justify-center bg-primary/20'>
                                <div className='rounded-full bg-primary p-1'>
                                  <svg
                                    className='size-3 text-white'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={3}
                                      d='M5 13l4 4L19 7'
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className='py-4 text-center text-sm text-muted-foreground'>
                        No hay productos con imágenes en esta colección. Agrega productos primero
                        para poder seleccionar una imagen de portada.
                      </div>
                    )
                  ) : (
                    <div className='py-4 text-center text-sm text-muted-foreground'>
                      <Upload className='mx-auto mb-2 size-6 text-gray-400' />
                      <p>
                        Primero debes crear la colección y agregar productos para poder seleccionar
                        una imagen de ellos.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='space-y-3'>
                  <ImageUploader
                    value={uploadedImageUrl}
                    onChange={handleUploadComplete}
                    onUploadComplete={(url) => {
                      handleUploadComplete(url)
                      toast.success('Imagen subida exitosamente')
                    }}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Sube una imagen desde tu ordenador para usar como portada de la colección.
                  </p>
                </div>
              )}
            </div>

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
