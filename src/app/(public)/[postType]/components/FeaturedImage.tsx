'use client'

import { ZoomIn } from 'lucide-react'

import { useDialog } from '@/hooks/useDialog'
import { Dialog } from '@/src/components/Dialog'

interface ImageUrl {
  alt: string
  url: string
}

interface Props {
  imageUrl: string
  title: string
  imageUrls: ImageUrl[]
}

export const FeaturedImage: React.FC<Props> = ({ imageUrl, imageUrls, title }) => {
  const { onOpenChange, open, openDialog } = useDialog()

  const handleImageClick = () => {
    openDialog()
  }

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
  }

  return (
    <>
      <div className='mb-10'>
        <div
          className='group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-xl shadow-2xl transition-all'
          onClick={handleImageClick}
        >
          <img
            src={imageUrl}
            alt={title}
            className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
          <div className='absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='rounded-full bg-white/20 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
              <ZoomIn className='size-6 text-white' />
            </div>
          </div>
        </div>
      </div>

      <Dialog.Gallery
        images={imageUrls}
        initialIndex={0}
        open={open}
        onOpenChange={handleOpenChange}
        title={title}
      />
    </>
  )
}
