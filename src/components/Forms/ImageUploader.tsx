import { CheckCircle, Loader2, Upload, X } from 'lucide-react'
import React, { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageUploaderProps {
  value?: string | null // Current image URL
  onChange: (resourceUrl: string | null) => void // Callback for when the URL changes
  hidePreview?: boolean // New prop to hide the internal preview
  onUploadComplete?: (resourceUrl: string) => void // Callback for when upload completes
  compact?: boolean // New prop for compact mode (table usage)
}

interface UploadedImage {
  id: string
  resourceUrl: string
  filename: string
  size: number
  preview: string
  status: 'uploading' | 'completed' | 'error'
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  compact = false,
  hidePreview,
  onChange,
  onUploadComplete,
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

        // Size is unknown for initial URL
        preview: value,

        // A dummy ID for initial value
        resourceUrl: value,
        // Extract filename from URL
        size: 0,
        status: 'completed',
      })
    } else if (!value && uploadedImage) {
      // Clear if value becomes null/undefined, regardless of the image id
      if (uploadedImage.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage.preview)
      }
      setUploadedImage(null)
    }
  }, [value, uploadedImage])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0] // Only take the first file for single upload
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

      const response = await fetch('/api/uploads', {
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

  // Modo compacto para uso en tablas
  if (compact) {
    return (
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isUploading}
            onClick={() => document.getElementById(inputId)?.click()}
            className='flex h-8 items-center gap-1 px-2 text-xs'
          >
            {isUploading ? (
              <Loader2 className='size-3 animate-spin' />
            ) : (
              <Upload className='size-3' />
            )}
            {isUploading ? 'Subiendo...' : 'Subir'}
          </Button>

          <Input
            id={inputId}
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='hidden'
          />

          {uploadedImage && (
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={removeImage}
              className='h-8 px-2 text-xs'
            >
              <X className='size-3' />
            </Button>
          )}
        </div>

        {/* Preview compacto */}
        {uploadedImage && (
          <div className='relative overflow-hidden rounded border'>
            <div className='relative aspect-square w-16'>
              <img
                src={uploadedImage.preview}
                alt={uploadedImage.filename}
                className='size-full object-cover'
              />

              {/* Overlay de estado */}
              <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                {uploadedImage.status === 'uploading' && (
                  <Loader2 className='size-4 animate-spin text-white' />
                )}
                {uploadedImage.status === 'completed' && (
                  <CheckCircle className='size-4 text-green-400' />
                )}
                {uploadedImage.status === 'error' && <X className='size-4 text-red-400' />}
              </div>
            </div>

            {/* Información compacta */}
            <div className='p-1 text-center'>
              <p className='truncate text-xs' title={uploadedImage.filename}>
                {uploadedImage.filename}
              </p>
              {uploadedImage.status === 'completed' && <p className='text-xs text-green-600'>✅</p>}
              {uploadedImage.status === 'error' && <p className='text-xs text-red-600'>❌</p>}
            </div>
          </div>
        )}

        {/* Placeholder compacto */}
        {!uploadedImage && (
          <div className='flex size-16 items-center justify-center rounded border-2 border-dashed border-gray-300 text-center'>
            <div className='flex flex-col items-center'>
              <Upload className='size-4 text-gray-400' />
              <span className='text-xs text-gray-500'>Imagen</span>
            </div>
          </div>
        )}
      </div>
    )
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
          {isUploading ? 'Subiendo...' : 'Subir Imagen'}
        </Button>

        <Input
          id={inputId}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='hidden'
        />

        <span className='text-sm text-muted-foreground'>JPG, PNG, WebP (máx. 10MB)</span>
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
            Haz clic en &quot;Subir Imagen&quot; para agregar una foto
          </p>
          <p className='mt-1 text-xs text-gray-500'>
            La imagen se optimizará automáticamente para la web
          </p>
        </div>
      )}
    </div>
  )
}
