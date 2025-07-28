/* eslint-disable @next/next/no-img-element */
import { CheckCircle, Loader2, Upload, X } from 'lucide-react'
import React, { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SupabaseImageUploaderProps {
  value?: string | null // Current image URL
  onChange: (resourceUrl: string | null) => void // Callback for when the URL changes
  hidePreview?: boolean // New prop to hide the internal preview
  onUploadComplete?: (resourceUrl: string) => void // Callback for when upload completes
  type?: 'profile' | 'background' | 'blog' | 'general' // Type of image being uploaded
  maxFileSize?: number // Max file size in bytes (default: 10MB)
  acceptedFormats?: string // Accepted file formats (default: image/*)
}

interface UploadedImage {
  id: string
  resourceUrl: string
  filename: string
  size: number
  preview: string
  status: 'uploading' | 'completed' | 'error'
}

export const SupabaseImageUploader: React.FC<SupabaseImageUploaderProps> = ({
  acceptedFormats = 'image/*',
  hidePreview,
  maxFileSize = 10 * 1024 * 1024,
  onChange,
  onUploadComplete,
  type = 'general', // 10MB default
  value,
}) => {
  const inputId = useId()
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (value && !uploadedImage) {
      // Initialize if a value is provided and no image is currently set
      setUploadedImage({
        filename: value.substring(value.lastIndexOf('/') + 1),
        id: 'initial',
        preview: value,
        resourceUrl: value,
        size: 0,
        status: 'completed',
      })
    } else if (!value && uploadedImage && uploadedImage.id === 'initial') {
      // Clear if value becomes null and it was an initial image
      setUploadedImage(null)
    }
  }, [value, uploadedImage])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0] // Only take the first file for single upload
    
    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`El archivo es demasiado grande. Máximo ${formatFileSize(maxFileSize)}`)
      return
    }

    await uploadFile(file)
    event.target.value = '' // Clear the input
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

    setUploadedImage(newImage)
    setIsUploading(true)

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

      setUploadedImage((prev) =>
        prev ? { ...prev, resourceUrl: data.resourceUrl, status: 'completed' as const } : null
      )

      onChange(data.resourceUrl) // Notify parent of the new URL
      onUploadComplete?.(data.resourceUrl) // Notify parent that the upload is complete
      toast.success(`Imagen "${file.name}" subida exitosamente`)
    } catch (error) {
      setUploadedImage((prev) => (prev ? { ...prev, status: 'error' as const } : null))

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error subiendo "${file.name}": ${errorMessage}`)
      onChange(null) // Notify parent of upload failure
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview)
    }
    setUploadedImage(null)
    onChange(null) // Notify parent that the image is removed
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'profile':
        return 'Avatar'
      case 'background':
        return 'Imagen de Fondo'
      case 'blog':
        return 'Imagen de Blog'
      default:
        return 'Imagen'
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          disabled={isUploading}
          onClick={() => document.getElementById(inputId)?.click()}
          className='flex items-center gap-2'
        >
          {isUploading ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <Upload className='size-4' />
          )}
          {isUploading ? 'Subiendo...' : `Subir ${getTypeLabel()}`}
        </Button>

        <Input
          id={inputId}
          type='file'
          accept={acceptedFormats}
          onChange={handleFileChange}
          className='hidden'
        />

        <span className='text-sm text-muted-foreground'>
          JPG, PNG, WebP (máx. {formatFileSize(maxFileSize)})
        </span>
      </div>

      {uploadedImage && !hidePreview && (
        <div className='space-y-2'>
          <div
            key={uploadedImage.id}
            className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
              uploadedImage.status === 'completed'
                ? 'border-green-200 bg-green-50'
                : uploadedImage.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className='relative aspect-square'>
              <img
                src={uploadedImage.preview}
                alt={uploadedImage.filename}
                className='size-full object-cover'
              />

              <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                {uploadedImage.status === 'uploading' && (
                  <Loader2 className='size-6 animate-spin text-white' />
                )}
                {uploadedImage.status === 'completed' && (
                  <CheckCircle className='size-6 text-green-400' />
                )}
                {uploadedImage.status === 'error' && <X className='size-6 text-red-400' />}
              </div>

              <Button
                type='button'
                variant='destructive'
                size='sm'
                className='absolute right-2 top-2 size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={removeImage}
              >
                <X className='size-3' />
              </Button>
            </div>

            <div className='space-y-1 p-2'>
              <p className='truncate text-xs font-medium' title={uploadedImage.filename}>
                {uploadedImage.filename}
              </p>
              {uploadedImage.size > 0 && (
                <p className='text-xs text-muted-foreground'>
                  {formatFileSize(uploadedImage.size)}
                </p>
              )}
              {uploadedImage.status === 'completed' && (
                <p className='text-xs font-medium text-green-600'>✅ Listo para usar</p>
              )}
              {uploadedImage.status === 'error' && (
                <p className='text-xs font-medium text-red-600'>❌ Error en subida</p>
              )}
              {uploadedImage.status === 'uploading' && (
                <p className='text-xs font-medium text-yellow-600'>⏳ Subiendo...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!uploadedImage && (
        <div className='rounded-lg border-2 border-dashed border-gray-300 py-6 text-center'>
          <Upload className='mx-auto mb-2 size-8 text-gray-400' />
          <p className='text-sm text-gray-600'>
            Haz clic en &quot;Subir {getTypeLabel()}&quot; para agregar una foto
          </p>
          <p className='mt-1 text-xs text-gray-500'>
            La imagen se optimizará automáticamente para la web
          </p>
        </div>
      )}
    </div>
  )
} 