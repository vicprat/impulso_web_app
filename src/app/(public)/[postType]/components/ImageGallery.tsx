'use client'
import { ZoomIn } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { useDialog } from '@/hooks/useDialog'
import { type PostWithRelations } from '@/modules/blog/types'
import { Dialog } from '@/src/components/Dialog'

interface ImageUrl {
  alt: string
  url: string
}

interface Props {
  images: string[]
  post: PostWithRelations
  imageUrls: ImageUrl[]
  featuredImageExists: boolean
}

export const ImageGallery: React.FC<Props> = ({ featuredImageExists, imageUrls, images, post }) => {
  const { onOpenChange, open, openDialog } = useDialog()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)

  const openImageModal = (index: number) => {
    const adjustedIndex = index + (featuredImageExists ? 1 : 0)
    setSelectedImageIndex(adjustedIndex)
    openDialog()
  }

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setSelectedImageIndex(0)
    }
  }

  return (
    <>
      <div className='relative'>
        <div className='absolute -inset-4 rounded-3xl bg-gradient-to-br via-transparent blur-3xl' />

        <Card className='bg-card/80 relative border-0 shadow-2xl backdrop-blur-sm'>
          <CardContent className='p-0'>
            <div className=' relative overflow-hidden rounded-t-lg bg-gradient-to-r p-8'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]' />

              <div className='relative'>
                <h3 className='mb-6 text-2xl font-bold text-on-surface lg:text-3xl'>
                  Galería de Imágenes
                </h3>

                <div className='mb-6 flex items-center gap-3'>
                  <div className='flex -space-x-2'>
                    {images.slice(0, 3).map((_, index) => (
                      <div
                        key={index}
                        className='relative size-10 rounded-full border-2 border-surface bg-gradient-to-br from-primary to-secondary'
                      >
                        <div className=' absolute -inset-1 rounded-full bg-gradient-to-br blur-md' />
                      </div>
                    ))}
                  </div>

                  <div className='text-sm text-on-surface-variant'>
                    {images.length} imagen
                    {images.length !== 1 ? 'es' : ''}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {images.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className='group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg transition-all duration-300 hover:scale-105 dark:from-slate-800 dark:to-slate-900'
                      onClick={() => openImageModal(index)}
                    >
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className='size-full object-cover transition-transform duration-300 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='rounded-full bg-white/20 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                          <ZoomIn className='size-4 text-white' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {images.length > 6 && (
                  <div className='mt-6 text-center'>
                    <div className='mx-auto max-w-md rounded-2xl bg-gradient-to-r p-6 backdrop-blur-sm'>
                      <div className='mb-3 flex items-center justify-center gap-2'>
                        <div className='size-2 animate-pulse rounded-full bg-primary' />
                        <div className='size-2 animate-pulse rounded-full bg-secondary' />
                        <div className='size-2 animate-pulse rounded-full bg-primary' />
                      </div>
                      <p className='text-sm text-on-surface-variant'>
                        Y {images.length - 6} imagen
                        {images.length - 6 !== 1 ? 'es' : ''} más...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className=' absolute -right-20 -top-20 size-40 rounded-full bg-gradient-to-br to-transparent blur-3xl' />
              <div className=' absolute -bottom-20 -left-20 size-40 rounded-full bg-gradient-to-br to-transparent blur-3xl' />
            </div>

            <div className='p-4 sm:p-6 lg:p-8'>
              {images.length === 1 && (
                <div
                  className=' group relative mx-auto max-w-3xl cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl transition-all duration-500 dark:from-slate-800 dark:to-slate-900'
                  onClick={() => openImageModal(0)}
                >
                  <img
                    src={images[0]}
                    alt='Imagen adicional'
                    className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                  <div className='absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='rounded-full bg-white/20 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                      <ZoomIn className='size-6 text-white' />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog.Gallery
        images={imageUrls}
        initialIndex={selectedImageIndex}
        open={open}
        onOpenChange={handleOpenChange}
        title={post.title}
      />
    </>
  )
}
