/* eslint-disable @next/next/no-img-element */
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageUploaderProps {
  onUploadComplete: (resourceUrl: string) => void
}

interface UploadedImage {
  id: string
  resourceUrl: string
  filename: string
  size: number
  preview: string
  status: 'uploading' | 'completed' | 'error'
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      await uploadFile(file)
    }

    event.target.value = ''
  }

  const uploadFile = async (file: File) => {
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const preview = URL.createObjectURL(file)

    const newImage: UploadedImage = {
      filename: file.name,
      id: uploadId,
      preview,
      resourceUrl: '',
      size: file.size,
      status: 'uploading',
    }

    setUploadedImages((prev) => [...prev, newImage])
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/uploads', {
        body: formData,
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir el archivo')
      }

      const data = await response.json()

      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === uploadId
            ? { ...img, resourceUrl: data.resourceUrl, status: 'completed' as const }
            : img
        )
      )

      onUploadComplete(data.resourceUrl)
      toast.success(`Imagen "${file.name}" subida exitosamente`)
    } catch (error) {
      setUploadedImages((prev) =>
        prev.map((img) => (img.id === uploadId ? { ...img, status: 'error' as const } : img))
      )

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error subiendo "${file.name}": ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (imageId: string) => {
    setUploadedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId)
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== imageId)
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          disabled={isUploading}
          onClick={() => document.getElementById('file-upload')?.click()}
          className='flex items-center gap-2'
        >
          {isUploading ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <Upload className='size-4' />
          )}
          {isUploading ? 'Subiendo...' : 'Subir Imágenes'}
        </Button>

        <Input
          id='file-upload'
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileChange}
          className='hidden'
        />

        <span className='text-sm text-muted-foreground'>JPG, PNG, WebP (máx. 10MB cada una)</span>
      </div>

      {uploadedImages.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>Imágenes para el producto:</h4>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                  image.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : image.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className='relative aspect-square'>
                  <img
                    src={image.preview}
                    alt={image.filename}
                    className='size-full object-cover'
                  />

                  <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                    {image.status === 'uploading' && (
                      <Loader2 className='size-6 animate-spin text-white' />
                    )}
                    {image.status === 'completed' && (
                      <CheckCircle className='size-6 text-green-400' />
                    )}
                    {image.status === 'error' && <X className='size-6 text-red-400' />}
                  </div>

                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    className='absolute right-2 top-2 size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100'
                    onClick={() => removeImage(image.id)}
                  >
                    <X className='size-3' />
                  </Button>
                </div>

                <div className='space-y-1 p-2'>
                  <p className='truncate text-xs font-medium' title={image.filename}>
                    {image.filename}
                  </p>
                  <p className='text-xs text-muted-foreground'>{formatFileSize(image.size)}</p>
                  {image.status === 'completed' && (
                    <p className='text-xs font-medium text-green-600'>✅ Listo para usar</p>
                  )}
                  {image.status === 'error' && (
                    <p className='text-xs font-medium text-red-600'>❌ Error en subida</p>
                  )}
                  {image.status === 'uploading' && (
                    <p className='text-xs font-medium text-yellow-600'>⏳ Subiendo...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedImages.length === 0 && (
        <div className='rounded-lg border-2 border-dashed border-gray-300 py-6 text-center'>
          <Upload className='mx-auto mb-2 size-8 text-gray-400' />
          <p className='text-sm text-gray-600'>
            Haz clic en &quot;Subir Imágenes&quot; para agregar fotos de tu obra
          </p>
          <p className='mt-1 text-xs text-gray-500'>
            Las imágenes se optimizarán automáticamente para la web
          </p>
        </div>
      )}
    </div>
  )
}
