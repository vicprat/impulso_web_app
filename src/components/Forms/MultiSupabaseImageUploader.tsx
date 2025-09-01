import { Loader2, Star, Upload, X } from 'lucide-react'
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

interface MultiSupabaseImageUploaderProps {
  existingImages?: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  type?: 'profile' | 'background' | 'blog' | 'general'
}

export const MultiSupabaseImageUploader: React.FC<MultiSupabaseImageUploaderProps> = ({
  existingImages = [],
  maxImages = 10,
  onImagesChange,
  type = 'blog',
}) => {
  const inputId = useId()
  const [ isUploading, setIsUploading ] = useState(false)
  const [ internalImages, setInternalImages ] = useState<string[]>(existingImages)

  React.useEffect(() => {
    setInternalImages(existingImages)
  }, [ existingImages ])

  const updateImages = useCallback((newImages: string[]) => {
    setInternalImages(newImages)
    onImagesChange(newImages)
  }, [ onImagesChange ])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - internalImages.length
    if (files.length > remainingSlots) {
      toast.error(`Solo puedes agregar ${remainingSlots} imagen(es) más`)
      return
    }

    const fileArray = Array.from(files)
    await uploadMultipleFiles(fileArray)

    event.target.value = ''
  }, [ existingImages.length, maxImages ])

  const uploadMultipleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)

    const newImages: ImageData[] = files.map((file, index) => {
      const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9) + index
      const preview = URL.createObjectURL(file)

      return {
        filename: file.name,
        id: uploadId,
        isNew: true,
        preview,
        size: file.size,
        status: 'uploading' as const,
        url: preview,
      }
    })

    const updatedImages = [ ...internalImages, ...newImages.map(img => img.url) ]
    updateImages(updatedImages)

    try {
      const uploadPromises = files.map(async (file, index) => {
        const uploadId = newImages[ index ].id

        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', type)

          const response = await fetch('/api/uploads/supabase', {
            body: formData,
            method: 'POST',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error ?? 'Error al subir el archivo')
          }

          const data = await response.json()
          return { filename: file.name, success: true, uploadId, url: data.resourceUrl }
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Error desconocido', filename: file.name, success: false, uploadId }
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result.success)

      let finalImages = [ ...newImages.map(img => img.url) ]

      successfulUploads.forEach((result) => {
        const tempImage = newImages.find(n => n.id === result.uploadId)
        if (tempImage) {
          const index = finalImages.findIndex(img => img === tempImage.url)
          if (index !== -1) {
            finalImages[ index ] = result.url
          }
        }
      })

      if (finalImages.length === 0) {
        finalImages = newImages.map(img => img.url)
      }

      updateImages(finalImages)

      if (successfulUploads.length === files.length) {
        toast.success(`${files.length} imagen(es) subida(s) exitosamente`)
      } else {
        const failedCount = files.length - successfulUploads.length
        toast.error(`${failedCount} imagen(es) falló(ron) al subir`)
      }

    } catch (error) {
      toast.error('Error al subir las imágenes')
    } finally {
      setIsUploading(false)
    }
  }, [ existingImages, onImagesChange, type ])

  const removeImage = useCallback((indexToRemove: number) => {
    const updatedImages = internalImages.filter((_, index) => index !== indexToRemove)
    updateImages(updatedImages)
    toast.success('Imagen eliminada')
  }, [ internalImages, updateImages ])

  const setPrimaryImage = useCallback((index: number) => {
    const updatedImages = [ ...internalImages ]
    const [ selectedImage ] = updatedImages.splice(index, 1)
    updatedImages.unshift(selectedImage)
    updateImages(updatedImages)
    toast.success('Imagen principal establecida')
  }, [ internalImages, updateImages ])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[ i ]}`
  }

  return (
    <div className='space-y-4'>
      {internalImages.length > 0 && (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {internalImages.map((imageUrl, index) => (
            <div key={index} className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'>
              <img
                alt={`Imagen ${index + 1}`}
                className='size-full object-cover transition-transform group-hover:scale-105'
                src={imageUrl}
              />

              <div className='absolute inset-0 bg-black/0 transition-all group-hover:bg-black/50'>
                <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
                  <div className='flex gap-2'>
                    {index === 0 && (
                      <Badge className='bg-primary text-primary-foreground'>
                        <Star className='mr-1 size-3' />
                        Principal
                      </Badge>
                    )}
                    {index !== 0 && (
                      <Button
                        className='size-8 rounded-full p-0'
                        size='sm'
                        variant='secondary'
                        onClick={() => setPrimaryImage(index)}
                      >
                        <Star className='size-4' />
                      </Button>
                    )}
                    <Button
                      className='size-8 rounded-full p-0'
                      size='sm'
                      variant='destructive'
                      onClick={() => removeImage(index)}
                    >
                      <X className='size-4' />
                    </Button>
                  </div>
                </div>
              </div>

              <div className='absolute bottom-2 right-2'>
                <Badge variant='secondary' className='text-xs'>
                  {index + 1}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='space-y-3'>
        <div className='relative'>
          <Input
            accept='image/*'
            className='cursor-pointer'
            disabled={isUploading || internalImages.length >= maxImages}
            id={inputId}
            multiple
            onChange={handleFileChange}
            type='file'
          />
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            {isUploading ? (
              <Loader2 className='size-4 animate-spin text-muted-foreground' />
            ) : (
              <Upload className='size-4 text-muted-foreground' />
            )}
          </div>
        </div>

        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            {internalImages.length} de {maxImages} imágenes
          </span>
          {isUploading && (
            <span className='flex items-center gap-2'>
              <Loader2 className='size-3 animate-spin' />
              Subiendo...
            </span>
          )}
        </div>

        {internalImages.length >= maxImages && (
          <p className='text-sm text-amber-600'>
            Has alcanzado el límite máximo de {maxImages} imágenes
          </p>
        )}
      </div>
    </div>
  )
}