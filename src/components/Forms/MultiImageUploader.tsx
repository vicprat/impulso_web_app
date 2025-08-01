/* eslint-disable @next/next/no-img-element */
import { CheckCircle, Loader2, Star, Upload, X } from 'lucide-react'
import React, { useCallback, useId, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageData {
  id: string
  url: string
  altText?: string
  isPrimary?: boolean
  isNew?: boolean
  filename?: string
  size?: number
  status?: 'uploading' | 'completed' | 'error'
  preview?: string
}

interface MultiImageUploaderProps {
  existingImages?: ImageData[]
  onImagesChange: (images: ImageData[]) => void
  maxImages?: number
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  existingImages = [],
  onImagesChange,
  maxImages = 10,
}) => {
  const inputId = useId()
  const [ isUploading, setIsUploading ] = useState(false)

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Verificar límite de imágenes
    const remainingSlots = maxImages - existingImages.length
    if (files.length > remainingSlots) {
      toast.error(`Solo puedes agregar ${remainingSlots} imagen(es) más`)
      return
    }

    // Convertir FileList a Array y subir en paralelo
    const fileArray = Array.from(files)
    await uploadMultipleFiles(fileArray)

    event.target.value = '' // Clear the input
  }, [ existingImages.length, maxImages ])

  const uploadMultipleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)

    // Crear previews para todas las imágenes
    const newImages: ImageData[] = files.map((file, index) => {
      const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9) + index
      const preview = URL.createObjectURL(file)

      return {
        filename: file.name,
        id: uploadId,
        preview,
        url: preview,
        size: file.size,
        status: 'uploading' as const,
        isNew: true,
      }
    })

    // Agregar todas las imágenes al estado
    const updatedImages = [ ...existingImages, ...newImages ]
    onImagesChange(updatedImages)

    try {
      // Subir archivos en paralelo
      const uploadPromises = files.map(async (file, index) => {
        const uploadId = newImages[ index ].id

        try {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/uploads', {
            body: formData,
            method: 'POST',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error ?? 'Error al subir el archivo')
          }

          const data = await response.json()
          return { uploadId, success: true, url: data.resourceUrl, filename: file.name }
        } catch (error) {
          return {
            uploadId,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
            filename: file.name
          }
        }
      })

      const results = await Promise.all(uploadPromises)

      // Actualizar estado con resultados
      const finalImages = updatedImages.map(img => {
        const result = results.find(r => r.uploadId === img.id)
        if (result) {
          if (result.success) {
            return { ...img, url: result.url, status: 'completed' as const }
          } else {
            return { ...img, status: 'error' as const }
          }
        }
        return img
      })

      onImagesChange(finalImages)

      // Mostrar toasts de resultados
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      if (successful.length > 0) {
        if (successful.length === 1) {
          toast.success(`Imagen "${successful[ 0 ].filename}" subida exitosamente`)
        } else {
          toast.success(`${successful.length} imágenes subidas exitosamente`)
        }
      }

      if (failed.length > 0) {
        if (failed.length === 1) {
          toast.error(`Error al subir "${failed[ 0 ].filename}": ${failed[ 0 ].error}`)
        } else {
          toast.error(`${failed.length} imágenes no pudieron ser subidas`)
        }
      }

    } catch (error) {
      console.error('Error en upload múltiple:', error)
      toast.error('Error al subir las imágenes')
    } finally {
      setIsUploading(false)
    }
  }, [ existingImages, onImagesChange ])

  const removeImage = useCallback((imageId: string) => {
    const imageToRemove = existingImages.find(img => img.id === imageId)
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview)
    }

    const updatedImages = existingImages.filter(img => img.id !== imageId)

    // Si se removió la imagen principal, hacer la primera imagen la principal
    if (imageToRemove?.isPrimary && updatedImages.length > 0) {
      updatedImages[ 0 ].isPrimary = true
    }

    onImagesChange(updatedImages)
  }, [ existingImages, onImagesChange ])

  const setPrimaryImage = useCallback((imageId: string) => {
    const updatedImages = existingImages.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }))

    onImagesChange(updatedImages)
  }, [ existingImages, onImagesChange ])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[ i ]}`
  }, [])

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          disabled={isUploading || existingImages.length >= maxImages}
          onClick={() => document.getElementById(inputId)?.click()}
          className='flex items-center gap-2'
        >
          {isUploading ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <Upload className='size-4' />
          )}
          {isUploading ? 'Subiendo...' : 'Agregar Imágenes'}
        </Button>

        <Input
          id={inputId}
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileChange}
          className='hidden'
        />

        <span className='text-sm text-muted-foreground'>
          {existingImages.length}/{maxImages} imágenes
        </span>
      </div>

      {existingImages.length > 0 && (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
          {existingImages.map((image, index) => (
            <div
              key={image.id}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${image.status === 'completed'
                ? 'border-green-200 bg-green-50'
                : image.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
                }`}
            >
              <img
                src={image.url}
                alt={image.altText || image.filename || `Imagen ${index + 1}`}
                className='h-full w-full object-cover'
              />

              {/* Overlay con estado de carga */}
              <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                {image.status === 'uploading' && (
                  <Loader2 className='size-6 animate-spin text-white' />
                )}
                {image.status === 'completed' && (
                  <CheckCircle className='size-6 text-green-400' />
                )}
                {image.status === 'error' && <X className='size-6 text-red-400' />}
              </div>

              {/* Badge de imagen principal */}
              {image.isPrimary && (
                <Badge className='absolute left-1 top-1 bg-primary text-primary-foreground text-xs px-1 py-0'>
                  Principal
                </Badge>
              )}

              {/* Botones de acción */}
              <div className='absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                {/* Botón para hacer principal */}
                {!image.isPrimary && image.status === 'completed' && (
                  <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    className='size-6 p-0 bg-white/90 hover:bg-white'
                    onClick={() => setPrimaryImage(image.id)}
                    title='Hacer imagen principal'
                  >
                    <Star className='size-3' />
                  </Button>
                )}

                {/* Botón para remover */}
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  className='size-6 p-0 bg-white/90 hover:bg-white'
                  onClick={() => removeImage(image.id)}
                  title='Remover imagen'
                >
                  <X className='size-3' />
                </Button>
              </div>

              {/* Información de la imagen */}
              <div className='absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white'>
                <p className='truncate text-xs font-medium' title={image.filename}>
                  {image.filename || `Imagen ${index + 1}`}
                </p>
                {image.size && image.size > 0 && (
                  <p className='text-xs opacity-75'>{formatFileSize(image.size)}</p>
                )}
                {image.status === 'completed' && (
                  <p className='text-xs font-medium text-green-400'>✅ Listo</p>
                )}
                {image.status === 'error' && (
                  <p className='text-xs font-medium text-red-400'>❌ Error</p>
                )}
                {image.status === 'uploading' && (
                  <p className='text-xs font-medium text-yellow-400'>⏳ Subiendo...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {existingImages.length === 0 && (
        <div className='rounded-lg border-2 border-dashed border-gray-300 py-6 text-center'>
          <Upload className='mx-auto mb-2 size-8 text-gray-400' />
          <p className='text-sm text-gray-600'>
            Haz clic en &quot;Agregar Imágenes&quot; para subir fotos
          </p>
          <p className='mt-1 text-xs text-gray-500'>
            Puedes seleccionar múltiples imágenes a la vez
          </p>
          <p className='mt-1 text-xs text-gray-500'>
            Las imágenes se optimizarán automáticamente para la web
          </p>
        </div>
      )}
    </div>
  )
} 